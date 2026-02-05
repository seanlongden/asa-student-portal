const Airtable = require('airtable');

const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);

const tables = {
    students: base('Students'),
    leads: base('Leads'),
    clients: base('Clients'),
    payments: base('Payments'),
    weeklyMetrics: base('Weekly Email Metrics')
};

async function getStudentByEmail(email) {
    const records = await tables.students.select({
          filterByFormula: `{Email} = '${email}'`,
          maxRecords: 1
    }).firstPage();
    return records.length > 0 ? formatStudent(records[0]) : null;
}

async function getStudentLeads(studentId) {
    const records = await tables.leads.select({
          filterByFormula: `FIND('${studentId}', ARRAYJOIN({Student}))`,
          sort: [{ field: 'Positive Reply Date', direction: 'desc' }]
    }).all();
    return records.map(formatLead);
}

async function getStudentClients(studentId) {
    const records = await tables.clients.select({
          filterByFormula: `FIND('${studentId}', ARRAYJOIN({Student}))`
    }).all();
    return records.map(formatClient);
}

async function getStudentMetrics(studentId) {
    const records = await tables.weeklyMetrics.select({
          filterByFormula: `FIND('${studentId}', ARRAYJOIN({Student}))`,
          sort: [{ field: 'Week Starting', direction: 'desc' }],
          maxRecords: 12
    }).all();
    return records.map(formatMetric);
}

function formatStudent(r) {
    return { id: r.id, name: r.get('Name'), email: r.get('Email'), company: r.get('Company'), emailTool: r.get('Email Tool'), hasApiKey: !!r.get('API Key') };
}

function formatLead(r) {
    return { id: r.id, name: r.get('Lead Name'), company: r.get('Company'), stage: r.get('Stage'), positiveReplyDate: r.get('Positive Reply Date') };
}

function formatClient(r) {
    return { id: r.id, name: r.get('Client Name'), monthlyValue: r.get('Monthly Value'), status: r.get('Status') };
}

function formatMetric(r) {
    return { weekStarting: r.get('Week Starting'), emailsSent: r.get('Emails Sent') || 0, replies: r.get('Replies') || 0, positiveReplies: r.get('Positive Replies') || 0 };
}

module.exports = { getStudentByEmail, getStudentLeads, getStudentClients, getStudentMetrics };
