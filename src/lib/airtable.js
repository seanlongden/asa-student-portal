import Airtable from 'airtable';

let _base;
function getBase() {
  if (!_base) {
    _base = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    }).base(process.env.AIRTABLE_BASE_ID);
  }
  return _base;
}

function table(name) {
  return getBase()(name);
}

// Sanitize values for Airtable filter formulas
function sanitize(val) {
  return String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// ---- Student functions ----

export async function getStudentByEmail(email) {
  const records = await table('Students')
    .select({
      filterByFormula: `{Email} = '${sanitize(email)}'`,
      maxRecords: 1,
    })
    .firstPage();
  return records.length > 0 ? formatStudent(records[0]) : null;
}

export async function createStudent({ name, email, stripeCustomerId }) {
  const record = await table('Students').create({
    Name: name,
    Email: email,
    'Stripe Customer ID': stripeCustomerId,
    Status: 'Active',
    'Join Date': new Date().toISOString().split('T')[0],
  });
  return formatStudent(record);
}

export async function updateStudent(recordId, fields) {
  const record = await table('Students').update(recordId, fields);
  return formatStudent(record);
}

// ---- Lead functions ----

export async function getStudentLeads(studentId) {
  const records = await table('Leads')
    .select({
      filterByFormula: `FIND('${sanitize(studentId)}', ARRAYJOIN({Student}))`,
      sort: [{ field: 'Positive Reply Date', direction: 'desc' }],
    })
    .all();
  return records.map(formatLead);
}

// ---- Client functions ----

export async function getStudentClients(studentId) {
  const records = await table('Clients')
    .select({
      filterByFormula: `FIND('${sanitize(studentId)}', ARRAYJOIN({Student}))`,
    })
    .all();
  return records.map(formatClient);
}

// ---- Metrics functions ----

export async function getStudentMetrics(studentId) {
  const records = await table('Weekly Email Metrics')
    .select({
      filterByFormula: `FIND('${sanitize(studentId)}', ARRAYJOIN({Student}))`,
      sort: [{ field: 'Week Starting', direction: 'desc' }],
      maxRecords: 12,
    })
    .all();
  return records.map(formatMetric);
}

export async function upsertWeeklyMetrics(studentId, weekStarting, metrics) {
  const existing = await table('Weekly Email Metrics')
    .select({
      filterByFormula: `AND(FIND('${sanitize(studentId)}', ARRAYJOIN({Student})), {Week Starting} = '${sanitize(weekStarting)}')`,
      maxRecords: 1,
    })
    .firstPage();

  const fields = {
    'Emails Sent': metrics.emailsSent || 0,
    Replies: metrics.replies || 0,
    'Positive Replies': metrics.positiveReplies || 0,
    'Open Rate': metrics.openRate || 0,
    'Bounce Rate': metrics.bounceRate || 0,
  };

  if (existing.length > 0) {
    return await table('Weekly Email Metrics').update(existing[0].id, fields);
  } else {
    return await table('Weekly Email Metrics').create({
      Student: [studentId],
      'Week Starting': weekStarting,
      ...fields,
    });
  }
}

// ---- Progress functions ----

export async function getStudentProgress(studentId) {
  const records = await table('Progress')
    .select({
      filterByFormula: `FIND('${sanitize(studentId)}', ARRAYJOIN({Student}))`,
      sort: [{ field: 'Module Order', direction: 'asc' }],
    })
    .all();
  return records.map(formatProgress);
}

export async function markModuleComplete(studentId, moduleId, moduleOrder) {
  const existing = await table('Progress')
    .select({
      filterByFormula: `AND(FIND('${sanitize(studentId)}', ARRAYJOIN({Student})), {Module ID} = '${sanitize(moduleId)}')`,
      maxRecords: 1,
    })
    .firstPage();

  if (existing.length > 0) {
    const record = await table('Progress').update(existing[0].id, {
      Status: 'Completed',
      'Completed Date': new Date().toISOString().split('T')[0],
    });
    return formatProgress(record);
  } else {
    const record = await table('Progress').create({
      Student: [studentId],
      'Module ID': moduleId,
      'Module Order': moduleOrder,
      Status: 'Completed',
      'Completed Date': new Date().toISOString().split('T')[0],
    });
    return formatProgress(record);
  }
}

// ---- Student Inputs functions ----

export async function getStudentInputs(studentId, moduleId) {
  const filter = moduleId
    ? `AND(FIND('${sanitize(studentId)}', ARRAYJOIN({Student})), {Module ID} = '${sanitize(moduleId)}')`
    : `FIND('${sanitize(studentId)}', ARRAYJOIN({Student}))`;

  const records = await table('Student Inputs')
    .select({
      filterByFormula: filter,
      sort: [{ field: 'Module Order', direction: 'asc' }],
    })
    .all();
  return records.map(formatInput);
}

export async function saveStudentInput(studentId, moduleId, moduleOrder, inputKey, value) {
  const existing = await table('Student Inputs')
    .select({
      filterByFormula: `AND(FIND('${sanitize(studentId)}', ARRAYJOIN({Student})), {Module ID} = '${sanitize(moduleId)}', {Input Key} = '${sanitize(inputKey)}')`,
      maxRecords: 1,
    })
    .firstPage();

  if (existing.length > 0) {
    const record = await table('Student Inputs').update(existing[0].id, {
      Value: value,
      'Updated At': new Date().toISOString(),
    });
    return formatInput(record);
  } else {
    const record = await table('Student Inputs').create({
      Student: [studentId],
      'Module ID': moduleId,
      'Module Order': moduleOrder,
      'Input Key': inputKey,
      Value: value,
      'Updated At': new Date().toISOString(),
    });
    return formatInput(record);
  }
}

// ---- Formatters ----

function formatStudent(r) {
  return {
    id: r.id,
    name: r.get('Name'),
    email: r.get('Email'),
    company: r.get('Company'),
    emailTool: r.get('Email Tool'),
    hasApiKey: !!r.get('API Key'),
    apiKey: r.get('API Key'),
    stripeCustomerId: r.get('Stripe Customer ID'),
    status: r.get('Status'),
    joinDate: r.get('Join Date'),
  };
}

function formatLead(r) {
  return {
    id: r.id,
    name: r.get('Lead Name'),
    company: r.get('Company'),
    stage: r.get('Stage'),
    positiveReplyDate: r.get('Positive Reply Date'),
  };
}

function formatClient(r) {
  return {
    id: r.id,
    name: r.get('Client Name'),
    monthlyValue: r.get('Monthly Value'),
    status: r.get('Status'),
  };
}

function formatMetric(r) {
  return {
    weekStarting: r.get('Week Starting'),
    emailsSent: r.get('Emails Sent') || 0,
    replies: r.get('Replies') || 0,
    positiveReplies: r.get('Positive Replies') || 0,
    openRate: r.get('Open Rate') || 0,
    bounceRate: r.get('Bounce Rate') || 0,
  };
}

function formatProgress(r) {
  return {
    id: r.id,
    moduleId: r.get('Module ID'),
    moduleOrder: r.get('Module Order'),
    status: r.get('Status'),
    completedDate: r.get('Completed Date'),
  };
}

function formatInput(r) {
  return {
    id: r.id,
    moduleId: r.get('Module ID'),
    moduleOrder: r.get('Module Order'),
    inputKey: r.get('Input Key'),
    value: r.get('Value'),
    updatedAt: r.get('Updated At'),
  };
}
