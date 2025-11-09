/**
 * ReportGenerator (Refatorado)
 *
 * Objetivo: reduzir complexidade cognitiva e isolar responsabilidades
 * - Política de acesso (filtragem/prioridade) separada
 * - Formatação (CSV/HTML) separada
 * - Sem mutações nos itens de entrada
 */

// ---- Políticas de Acesso --------------------------------------------------

const isAdmin = (user) => user?.role === 'ADMIN';
const isStandardUser = (user) => user?.role === 'USER';

function applyAccessPolicy(user, items) {
  if (isAdmin(user)) {
    // Admin vê todos; marca prioridade quando value > 1000 (sem mutar o original)
    return items.map((it) => ({ ...it, priority: it.value > 1000 }));
  }
  if (isStandardUser(user)) {
    // User vê apenas itens com value <= 500
    return items.filter((it) => it.value <= 500);
  }
  // Usuários desconhecidos: política conservadora (sem itens)
  return [];
}

// ---- Cálculo do total -----------------------------------------------------

function calculateTotal(items) {
  return items.reduce((sum, it) => sum + (it?.value ?? 0), 0);
}

// ---- Formatação -----------------------------------------------------------

function formatCsv(user, items) {
  let out = 'ID,NOME,VALOR,USUARIO\n';
  for (const it of items) {
    out += `${it.id},${it.name},${it.value},${user.name}\n`;
  }
  out += '\nTotal,,\n';
  out += `${calculateTotal(items)},,\n`;
  return out.trim();
}

function formatHtml(user, items) {
  let out = '';
  out += '<html><body>\n';
  out += '<h1>Relatório</h1>\n';
  out += `<h2>Usuário: ${user.name}</h2>\n`;
  out += '<table>\n';
  out += '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n';

  for (const it of items) {
    const style = it.priority ? 'style="font-weight:bold;"' : '';
    const open = style ? `<tr ${style}>` : '<tr>';
    out += `${open}<td>${it.id}</td><td>${it.name}</td><td>${it.value}</td></tr>\n`;
  }

  out += '</table>\n';
  out += `<h3>Total: ${calculateTotal(items)}</h3>\n`;
  out += '</body></html>\n';
  return out.trim();
}

function formatReport(type, user, items) {
  if (type === 'CSV') return formatCsv(user, items);
  if (type === 'HTML') return formatHtml(user, items);
  // Tipos desconhecidos: string vazia (comportamento simples/defensivo)
  return '';
}

// ---- API Pública ----------------------------------------------------------

class ReportGenerator {
  constructor(database) {
    this.db = database; // mantido para compatibilidade, não usado nesta versão
  }

  generateReport(reportType, user, items) {
    const safeItems = Array.isArray(items) ? items : [];
    const view = applyAccessPolicy(user, safeItems);
    return formatReport(reportType, user, view);
  }
}

module.exports = { ReportGenerator };
