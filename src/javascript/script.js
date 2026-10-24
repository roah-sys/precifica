const R = n => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const $ = id => document.getElementById(id);
const CATS = {
  doces:      { nome: 'Brigadeiro', margem: 60, ing: 'Ingredientes da receita (R$)', un: 'Unidades que a receita rende',
                ex: { ing: 17.5, desp: 0.5, mao: 12, emb: 8.8, un: 22 }, dica: 'Exemplo: 1 receita de brigadeiro rende cerca de 22 unidades de 20 g. Margem usada: 60%.' },
  salgados:   { nome: 'Coxinha', margem: 40, ing: 'Ingredientes da receita (R$)', un: 'Unidades que a receita rende',
                ex: { ing: 65, desp: 9, mao: 35, emb: 15, un: 50 }, dica: 'Exemplo: 1 receita de coxinha rende cerca de 50 unidades de 90 g. Margem usada: 40%.' },
  marmitas:   { nome: 'Marmita', margem: 50, ing: 'Ingredientes por marmita (R$)', un: 'Marmitas produzidas',
                ex: { ing: 9.5, desp: 0.7, mao: 3.5, emb: 1.5, un: 1 }, dica: 'Exemplo: marmita de bife de patinho, custos por marmita. Margem usada: 50%.' },
  bijuterias: { nome: 'Bijuteria', margem: 40, ing: 'Materiais (R$)', un: 'Peças produzidas', ex: null,
                dica: 'Informe o custo dos materiais e demais gastos do lote. Margem usada: 40%.' }
};
const campos = ['ing', 'desp', 'mao', 'emb', 'un'];
const num = id => parseFloat($(id).value.replace(',', '.'));

$('categoria').addEventListener('change', () => {
  const c = CATS[$('categoria').value];
  $('dica').hidden = $('exemplo').hidden = !c;
  if (!c) return;
  $('dica').textContent = c.dica;
  $('exemplo').hidden = !c.ex;
  $('l-ing').textContent = c.ing;
  $('l-un').textContent = c.un;
  $('margem').value = c.margem;
  campos.forEach(k => { $(k).placeholder = c.ex ? String(c.ex[k]).replace('.', ',') : (k === 'un' ? '1' : '0,00'); });
});

$('exemplo').addEventListener('click', () => {
  const c = CATS[$('categoria').value];
  if (c && c.ex) campos.forEach(k => $(k).value = c.ex[k]);
});

$('form').addEventListener('submit', e => {
  e.preventDefault();
  const erro = $('erro'); erro.hidden = true;
  const cat = CATS[$('categoria').value];
  const v = { ing: num('ing'), desp: num('desp') || 0, mao: num('mao') || 0, emb: num('emb') || 0, un: num('un') };
  const m = num('margem'), ref = num('ref');
  const falha = !cat ? 'Selecione o produto.'
    : !(v.ing > 0) ? 'Informe o custo dos ingredientes ou materiais.'
    : !(v.un >= 1) ? 'Informe quantas unidades foram produzidas.'
    : !(m >= 0 && m < 100) ? 'A margem de lucro deve estar entre 0% e 99%.' : '';
  if (falha) { erro.textContent = falha; erro.hidden = false; return; }

  const u = { ing: v.ing / v.un, desp: v.desp / v.un, mao: v.mao / v.un, emb: v.emb / v.un };
  const custo = u.ing + u.desp + u.mao + u.emb;
  const preco = custo / (1 - m / 100);
  const lucro = preco - custo;
  let comp = '';
  if (ref > 0) {
    const d = (preco - ref) / ref * 100;
    comp = `<p class="comp ${preco > ref ? 'acima' : 'ok'}">${preco > ref
      ? `Seu preço está ${d.toFixed(0)}% acima da referência de ${R(ref)}. Revise custos ou a margem.`
      : `Seu preço está dentro da referência de ${R(ref)} (${Math.abs(d).toFixed(0)}% abaixo).`}</p>`;
  }
  $('resultado').innerHTML = `
    <h2>Preço sugerido por ${cat.nome.toLowerCase()}</h2>
    <p class="preco">${R(preco)}</p>
    <p class="conta">${R(custo)} ÷ (1 − ${m / 100}) = ${R(preco)} · markup de ${(1 / (1 - m / 100)).toFixed(2).replace('.', ',')}×</p>
    <table><tbody>
      <tr><td>Ingredientes / materiais</td><td>${R(u.ing)}</td></tr>
      <tr><td>Despesas</td><td>${R(u.desp)}</td></tr>
      <tr><td>Mão de obra</td><td>${R(u.mao)}</td></tr>
      <tr><td>Embalagem</td><td>${R(u.emb)}</td></tr>
      <tr class="total"><td>Custo total por unidade</td><td>${R(custo)}</td></tr>
      <tr><td>Lucro por unidade</td><td>${R(lucro)}</td></tr>
      <tr><td>Lucro do lote (${v.un} un.)</td><td>${R(lucro * v.un)}</td></tr>
    </tbody></table>${comp}`;
});
