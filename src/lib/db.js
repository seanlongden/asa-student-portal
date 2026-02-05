import { createClient } from '@supabase/supabase-js';

let _supabase;
function supabase() {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }
  return _supabase;
}

// ---- Student functions ----

export async function getStudentByEmail(email) {
  const { data, error } = await supabase()
    .from('students')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data ? formatStudent(data) : null;
}

export async function createStudent({ name, email, stripeCustomerId }) {
  const { data, error } = await supabase()
    .from('students')
    .insert({
      name,
      email,
      stripe_customer_id: stripeCustomerId,
      status: 'Active',
      join_date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single();

  if (error) throw error;
  return formatStudent(data);
}

export async function updateStudent(id, fields) {
  const dbFields = {};
  const fieldMap = {
    emailTool: 'email_tool',
    apiKey: 'api_key',
    status: 'status',
    stripeCustomerId: 'stripe_customer_id',
    name: 'name',
    email: 'email',
    company: 'company',
  };

  for (const [key, value] of Object.entries(fields)) {
    dbFields[fieldMap[key] || key] = value;
  }

  const { data, error } = await supabase()
    .from('students')
    .update(dbFields)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return formatStudent(data);
}

// ---- Lead functions ----

export async function getStudentLeads(studentId) {
  const { data, error } = await supabase()
    .from('leads')
    .select('*')
    .eq('student_id', studentId)
    .order('positive_reply_date', { ascending: false, nullsFirst: false });

  if (error) throw error;
  return data.map(formatLead);
}

// ---- Client functions ----

export async function getStudentClients(studentId) {
  const { data, error } = await supabase()
    .from('clients')
    .select('*')
    .eq('student_id', studentId);

  if (error) throw error;
  return data.map(formatClient);
}

// ---- Metrics functions ----

export async function getStudentMetrics(studentId) {
  const { data, error } = await supabase()
    .from('weekly_email_metrics')
    .select('*')
    .eq('student_id', studentId)
    .order('week_starting', { ascending: false })
    .limit(12);

  if (error) throw error;
  return data.map(formatMetric);
}

export async function upsertWeeklyMetrics(studentId, weekStarting, metrics) {
  const { data, error } = await supabase()
    .from('weekly_email_metrics')
    .upsert(
      {
        student_id: studentId,
        week_starting: weekStarting,
        emails_sent: metrics.emailsSent || 0,
        replies: metrics.replies || 0,
        positive_replies: metrics.positiveReplies || 0,
        open_rate: metrics.openRate || 0,
        bounce_rate: metrics.bounceRate || 0,
      },
      { onConflict: 'student_id,week_starting' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ---- Progress functions ----

export async function getStudentProgress(studentId) {
  const { data, error } = await supabase()
    .from('progress')
    .select('*')
    .eq('student_id', studentId)
    .order('module_order', { ascending: true });

  if (error) throw error;
  return data.map(formatProgress);
}

export async function markModuleComplete(studentId, moduleId, moduleOrder) {
  const { data, error } = await supabase()
    .from('progress')
    .upsert(
      {
        student_id: studentId,
        module_id: moduleId,
        module_order: moduleOrder,
        status: 'Completed',
        completed_date: new Date().toISOString().split('T')[0],
      },
      { onConflict: 'student_id,module_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return formatProgress(data);
}

// ---- Student Inputs functions ----

export async function getStudentInputs(studentId, moduleId) {
  let query = supabase()
    .from('student_inputs')
    .select('*')
    .eq('student_id', studentId)
    .order('module_order', { ascending: true });

  if (moduleId) {
    query = query.eq('module_id', moduleId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data.map(formatInput);
}

export async function saveStudentInput(studentId, moduleId, moduleOrder, inputKey, value) {
  const { data, error } = await supabase()
    .from('student_inputs')
    .upsert(
      {
        student_id: studentId,
        module_id: moduleId,
        module_order: moduleOrder,
        input_key: inputKey,
        value,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'student_id,module_id,input_key' }
    )
    .select()
    .single();

  if (error) throw error;
  return formatInput(data);
}

// ---- Formatters ----

function formatStudent(r) {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    company: r.company,
    emailTool: r.email_tool,
    hasApiKey: !!r.api_key,
    apiKey: r.api_key,
    stripeCustomerId: r.stripe_customer_id,
    status: r.status,
    joinDate: r.join_date,
  };
}

function formatLead(r) {
  return {
    id: r.id,
    name: r.lead_name,
    company: r.company,
    stage: r.stage,
    positiveReplyDate: r.positive_reply_date,
  };
}

function formatClient(r) {
  return {
    id: r.id,
    name: r.client_name,
    monthlyValue: r.monthly_value,
    status: r.status,
  };
}

function formatMetric(r) {
  return {
    weekStarting: r.week_starting,
    emailsSent: r.emails_sent || 0,
    replies: r.replies || 0,
    positiveReplies: r.positive_replies || 0,
    openRate: r.open_rate || 0,
    bounceRate: r.bounce_rate || 0,
  };
}

function formatProgress(r) {
  return {
    id: r.id,
    moduleId: r.module_id,
    moduleOrder: r.module_order,
    status: r.status,
    completedDate: r.completed_date,
  };
}

function formatInput(r) {
  return {
    id: r.id,
    moduleId: r.module_id,
    moduleOrder: r.module_order,
    inputKey: r.input_key,
    value: r.value,
    updatedAt: r.updated_at,
  };
}
