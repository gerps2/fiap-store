# FIAP Store — Decisões de Design

Demo pedagógica de microfrontends Angular 21 + Native Federation, redesenhada como marketplace premium para a PosTech FIAP. Este documento reúne as decisões visuais para servir de roteiro durante a aula.

---

## 1. Identidade visual — edtech marketplace

**Ponto-de-vista:** Apple Store conhece edtech. Preto-absoluto (#1A1A1A) no shell, **vermelho FIAP (#ED1C24)** como acento dominante — CTAs, preços, badges, halos de hover, border-left de toasts não-lidos. A escolha de tratar o vermelho como *acento escasso* (não fundo) é o que separa "tech premium" de "parece um banco".

| Papel | Cor | Uso |
|------|-----|-----|
| Brand | `#ED1C24` | CTAs, preços, hover glow, badges de urgência |
| Dark | `#1A1A1A` | Navbar, texto principal, zonas high-contrast |
| Surface | `#F5F5F5` | Fundo do app (não branco puro — reduz fadiga) |
| White | `#FFFFFF` | Cards, inputs, painéis elevados |

**Por quê vermelho escasso?** Se tudo é vermelho, nada é vermelho. O olho do aluno é guiado pelo preço → CTA → badge, nessa ordem.

---

## 2. Tipografia

- **Display (Poppins 400-900):** números, preços, headlines, botões — geometria forte, peso 800/900 dá hierarquia imediata no hero (`--text-5xl: 72px`).
- **Body (Inter 400-700):** texto corrido, descrições, labels de formulário — altura-x alta, legível em 14px.

Pareamento evita o look "AI slop" do Inter-em-tudo. Carregados via `<link preconnect>` + `@import` para reduzir FOUT.

**Letter-spacing é token**, não chute:
- `--tracking-tight: -0.02em` em headlines grandes (compacta o display)
- `--tracking-wider: 0.16em` em eyebrows uppercase (respira)

---

## 3. Sistema de tokens — o coração do compartilhamento

Todos os valores vivem em `projects/shared-ui/styles/tokens.css`. **Nenhum componente usa valor cru** — tudo é `var(--fiap-*)`. Isso vira talking point central da aula:

> "Trocar o vermelho da marca é editar UMA linha. Isso é `@fiap/shared-ui` fazendo seu trabalho — design system distribuído entre MFEs sem runtime sharing."

Arquitetura de camadas:

```
tokens.css       → primitivos (cores, fontes, espaços, shadows, motion)
  ↓
primitives.css   → classes utilitárias (.fiap-btn-primary, .fiap-product-card, .fiap-toast)
  ↓
host/styles.css  → importa ambos, aplica reset + scrollbar
  ↓
MFE components   → consomem tokens via :host + ViewEncapsulation.Emulated
```

O `skip: ['@fiap/shared-ui']` no `federation.config.js` faz o bundle inlinar os estilos em cada MFE — zero conflito de versão, zero corrida por quem carrega primeiro.

---

## 4. Motion — micro-interação como sinal de qualidade

Três easings compõem a linguagem de movimento:

- `--ease-out` (normal): transições utilitárias
- `--ease-spring` (`cubic-bezier(0.34, 1.56, 0.64, 1)`): overshoot em hover de cards, pop de badge, drawer slide-in
- `--ease-in-out`: fades simétricos

**Highlights de animação:**
- **Botão primário**: sweep diagonal de luz no hover (`::after` com gradiente + translate).
- **Product card**: `translateY(-6px)` + sombra com tint vermelho `rgba(237,28,36,0.28)` — parece "pegar fogo" no hover.
- **Cart badge**: keyframe `fiap-badge-pop` com overshoot (0 → 1.25 → 1).
- **Drawer do carrinho**: slide 440px da direita em 440ms spring.
- **Toast**: entra por translateX(120%) → 0 com spring, sai com ease-out.
- **Hero**: headline em stagger reveal.

Regra que conta em aula: *"Micro-interação boa é invisível — você só nota se eu tirar."*

---

## 5. MFE boundaries visíveis (feature didática)

O atributo `data-fiap-dev-boundaries="true"` no `<html>` ativa uma outline tracejada vermelha em todo componente que tiver `class="mfe-boundary"`, com o nome do MFE como label no canto superior direito (via `::before` + `data-mfe`).

```html
<html data-fiap-dev-boundaries="true">
```

```css
html[data-fiap-dev-boundaries="true"] .mfe-boundary {
  outline: 1px dashed rgba(237, 28, 36, 0.45);
}
html[data-fiap-dev-boundaries="true"] .mfe-boundary::before {
  content: attr(data-mfe);  /* "mfe-produtos", "mfe-carrinho", ... */
}
```

Aplicado em cada remote via `@HostBinding('class') = 'mfe-boundary'` + `@HostBinding('attr.data-mfe')`. Para desligar em produção, basta remover o atributo do `<html>` — zero refactor.

**Valor pedagógico:** o aluno vê em tempo real onde termina um MFE e começa outro, sem abrir DevTools.

---

## 6. Redesign por MFE

### Shell / mfe-nav (host)
Navbar sticky `#1A1A1A`, wordmark **FIAP | STORE** (divisor vermelho), links uppercase com underline vermelho no active, avatar "AF" com gradiente, badge do carrinho com pop animation. Hamburger drawer em mobile.

### Home / mfe-home (host)
Hero 72vh com grain SVG overlay + badge pulsante "AO LIVE" + palavra acentuada em vermelho. 4 trust pills embaixo. Grid de categorias + slots de produtos/carrinho/checkout embed. CTA banner final dark com halo vermelho.

### Catálogo / mfe-produtos
Grid responsivo 2→3→4 cols, sidebar sticky de filtros (chips de categoria, faixa de preço, rating em estrelas SVG). Skeletons de 800ms com shimmer. 8 produtos mock com ícones SVG por tipo.

### Carrinho / mfe-carrinho
**Drawer slide-in** de 440px da direita — não mais card embed. Trigger pill + backdrop blur + ESC/click-fora fecha. Stepper de quantidade, footer com subtotal, frete (free > R$150), total em vermelho bold. Empty state com ilustração SVG + CTA "Explorar catálogo". Auto-abre se rota for `/carrinho`.

### Checkout / mfe-checkout
Grid 2 cols: 3 cards empilhados (Contato / Entrega / Pagamento) + resumo sticky 380px. Radio-cards de pagamento com expansão `@switch` (Pix mostra QR mock + 5% off). Tela de sucesso com checkmark spring-animated.

### Notificações / mfe-notificacoes
**Sino** com SVG bell branco na navbar + badge vermelho animado. Dropdown 360px, fecha em click-fora/ESC. **Stack de toasts** top-right, 4 variantes (success verde, warning âmbar, info azul, error vermelho), border-left de 4px como *afinity marker*. `ToastService` injetável dispara demos em cascata 500/1500/3000ms.

---

## 7. O que evitamos (anti-AI-slop)

| Não fizemos | Por quê |
|-------------|---------|
| Fonte Inter em tudo | Pareamento Poppins/Inter evita o look genérico de landing page 2023 |
| Gradient roxo → azul | Óbvio, clichê. Vermelho sólido com glow é mais editorial |
| Border radius 8px em tudo | Escala: `xs(4) / sm(8) / md(12) / lg(16) / pill(999)` — cada um com intenção |
| Sombra padrão `0 4px 6px` | Nossa `--shadow-card-hover` tem tint vermelho — assina a marca |
| Cards iguais com foto+título+CTA | Rating, badge de desconto, preço risky-red, ícone SVG por categoria — densidade informacional |
| Animar tudo o tempo todo | Motion concentrado em 5 momentos-chave: hover card, badge pop, drawer, toast, CTA sweep |

---

## 8. Talking points para a aula

1. **"Por que um MFE precisa de design system?"** — Sem `shared-ui`, cada MFE vira um look-and-feel diferente. Com ele, a marca se mantém mesmo com teams independentes.
2. **"Por que não compartilhar o CSS via shared em runtime?"** — `skip` no federation bundla tudo inline. Trade-off: KB duplicado vs. zero race condition. Para design system pequeno (<20KB), inline vence.
3. **"Como ver o boundary de cada MFE?"** — Mostrar o atributo `data-fiap-dev-boundaries`, ligar/desligar ao vivo.
4. **"E o vermelho vira laranja amanhã?"** — Edite 1 linha em `tokens.css`, recarregue os 5 apps. Design system funcionando.
5. **"Como o carrinho vira drawer em `/carrinho` mas é embed na home?"** — Mesmo componente, dois modos via `@HostBinding` + `effect()` lendo a URL. Comunicação entre MFEs sem event bus global.

---

**Stack visual final:** Poppins + Inter · vermelho FIAP como acento · spring easing nos momentos-chave · MFE boundaries opt-in · tokens como única fonte de verdade.

*Gerado em 2026-04-15 · Aula 2 — Module Federation.*
