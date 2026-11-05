import { TestBed } from '@angular/core/testing';
import { DescricaoProdutoService, type DescricaoProduto } from './descricao-produto.service';

const base: DescricaoProduto = {
  titulo: 'Camiseta FIAP',
  html: '<p>Algodão <strong>orgânico</strong> com estampa exclusiva</p>',
  destaque: false,
};

describe('DescricaoProdutoService', () => {
  let service: DescricaoProdutoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DescricaoProdutoService);
  });

  it('remove scripts e handlers do HTML do CMS', () => {
    const html = service.renderizar({
      ...base,
      html: '<p onclick="roubar()">Oi</p><script>alert(1)</script>',
    });
    expect(html).toContain('<p>Oi</p>');
    expect(html).not.toContain('script');
    expect(html).not.toContain('onclick');
  });

  it('gera tokens CSRF únicos', () => {
    expect(service.gerarTokenCsrf()).not.toBe(service.gerarTokenCsrf());
  });

  it('monta a URL do CMS sem credenciais e com slug codificado', () => {
    expect(service.urlCms('caneca azul')).toBe('https://cms.fiap-store.dev/produtos/caneca%20azul');
  });

  it('devolve o texto inteiro quando cabe no limite', () => {
    expect(service.resumir(base, 100)).toBe('Algodão orgânico com estampa exclusiva');
  });

  it('corta na última palavra antes do limite', () => {
    expect(service.resumir(base, 18)).toBe('Algodão orgânico…');
  });

  it('corta no limite quando não há espaço', () => {
    expect(service.resumir({ ...base, html: 'abcdefghij' }, 4)).toBe('abcd…');
  });

  it('define o selo conforme destaque e tamanho do título', () => {
    expect(service.selo({ ...base, destaque: true })).toBe('Destaque');
    expect(service.selo(base)).toBe('Novo');
    expect(service.selo({ ...base, titulo: 'x'.repeat(41) })).toBe('Detalhes');
  });
});
