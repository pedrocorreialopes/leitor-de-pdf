# 📖 Leitor de PDFs Avançado

Um leitor de PDFs moderno e sofisticado com efeito realista de virar página, modo claro/escuro e interface intuitiva. Desenvolvido com tecnologias web modernas para proporcionar uma experiência de leitura imersiva.

## ✨ Características Principais

### 📚 Interface de Leitura Avançada
- **Efeito Realista de Virar Página**: Animação 3D suave que simula o virar de páginas de um livro físico
- **Modo Claro/Escuro**: Transição suave entre temas para leitura confortável em qualquer ambiente
- **Leitura Responsiva**: Interface adaptativa para desktop, tablet e dispositivos móveis
- **Navegação Intuitiva**: Controles visuais e por teclado para fácil navegação

### ⚡ Performance e Tecnologia
- **PDF.js Integration**: Renderização de alta qualidade com a biblioteca oficial do PDF.js
- **Sistema de Cache Inteligente**: Pré-renderização de páginas adjacentes para navegação fluida
- **Otimização de Performance**: Lazy loading e gestão eficiente de memória
- **Web Standards Modernos**: HTML5 semântico, CSS3 avançado e JavaScript ES6+

### ♿ Acessibilidade
- **WCAG 2.1 AA**: Compatível com diretrizes de acessibilidade
- **Navegação por Teclado**: Atalhos completos para navegação sem mouse
- **Screen Reader Support**: Estrutura semântica para leitores de tela
- **Alto Contraste**: Suporte para modo de alto contraste

### 🎨 Design e UX
- **Design System Moderno**: Sistema de design consistente com variáveis CSS
- **Micro-interações**: Feedback visual suave para todas as ações
- **Animações Performance**: Animações otimizadas com GPU acceleration
- **Modo Tela Cheia**: Experiência imersiva de leitura

## 🚀 Como Usar

### 1. Carregar um PDF
- Clique no botão "Carregar PDF" no canto superior direito
- Selecione um arquivo PDF do seu computador
- O leitor processará automaticamente o documento

### 2. Navegação
- **Botões de Navegação**: Use os botões "Anterior" e "Próximo" na parte inferior
- **Teclado**: 
  - `←` ou `Page Up`: Página anterior
  - `→` ou `Page Down`: Próxima página
  - `Home`: Primeira página
  - `End`: Última página
  - `f`: Alternar tela cheia
  - `t`: Alternar tema
  - `Esc`: Sair do modo tela cheia

### 3. Temas
- Clique no botão de tema (🌙/☀️) para alternar entre modo claro e escuro
- O tema é salvo automaticamente e persistirá entre sessões

### 4. Tela Cheia
- Clique no botão de tela cheia para entrar no modo imersivo
- Pressione `Esc` ou clique novamente no botão para sair

## 🛠️ Tecnologias Utilizadas

### Frontend Core
- **HTML5 Semântico**: Estrutura acessível e SEO-friendly
- **CSS3 Moderno**: Grid, Flexbox, variáveis CSS e animações avançadas
- **JavaScript ES6+**: Classes, async/await, modules e features modernas

### Bibliotecas
- **PDF.js 3.11.174**: Renderização de PDFs de alta performance
- **Web APIs**: Intersection Observer, Resize Observer, Web Animations

### Performance
- **Code Splitting**: Carregamento otimizado de recursos
- **Lazy Loading**: Carregamento sob demanda de páginas
- **Cache Management**: Sistema inteligente de cache de páginas
- **Debouncing**: Otimização de eventos de resize e scroll

## 📁 Estrutura do Projeto

```
├── index.html              # HTML principal com estrutura semântica
├── css/
│   └── style.css          # Estilos principais com sistema de temas
├── js/
│   └── main.js            # JavaScript principal com classe AdvancedPDFReader
└── README.md               # Documentação do projeto
```

## 🎯 Funcionalidades Avançadas

### Sistema de Cache Inteligente
- Cache de até 50 páginas renderizadas
- Gestão automática de memória
- Pré-renderização de páginas adjacentes

### Otimização de Performance
- Renderização adaptativa baseada no viewport
- Intersection Observer para carregamento eficiente
- Debounce de eventos de resize

### Persistência de Dados
- Salvamento automático de preferências
- Última página lida
- Tema selecionado

### Acessibilidade Avançada
- Suporte para prefers-reduced-motion
- Alto contraste automático
- Navegação completa por teclado
- Labels ARIA dinâmicos

## 🔧 Configuração e Desenvolvimento

### Requisitos
- Navegador moderno com suporte para ES6+
- Conexão com internet (para CDN do PDF.js)

### Instalação Local
1. Clone ou baixe os arquivos do projeto
2. Abra `index.html` em um navegador web moderno
3. Não requer servidor local (funciona com `file://`)

### Configuração
O sistema possui configurações padrão otimizadas, mas pode ser personalizado editando o objeto `config` na classe `AdvancedPDFReader`:

```javascript
config: {
    pageScale: 1.5,           // Escala de renderização
    pageQuality: 2.0,         // Qualidade de renderização
    enableCache: true,          // Habilitar cache de páginas
    maxCacheSize: 50,           // Máximo de páginas em cache
    animationDuration: 600,   // Duração da animação de virar página
    keyboardNavigation: true,   // Navegação por teclado
    autoSave: true              // Salvamento automático de preferências
}
```

## 🌐 Compatibilidade

### Navegadores Suportados
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Recursos Opcionais Suportados
- Service Workers (para funcionalidade offline)
- Web Animations API (para animações mais suaves)
- Intersection Observer (para performance otimizada)

## 📊 Performance

### Métricas Alvo
- **Lighthouse Score**: Mínimo 90 em Desktop, 80 em Mobile
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Otimizações Implementadas
- CSS e JavaScript minificados
- Imagens otimizadas e responsivas
- Animações com GPU acceleration
- Event listeners eficientes

## 🔒 Segurança

- Processamento de PDFs totalmente cliente-side
- Sem envio de dados para servidores externos
- Validação de tipos de arquivo
- Limites de tamanho de arquivo (50MB)

## 🎨 Personalização

### Cores e Temas
O sistema utiliza variáveis CSS para fácil personalização:

```css
:root {
  --color-primary: #2563eb;
  --color-secondary: #64748b;
  --bg-primary: #ffffff;
  --text-primary: #0f172a;
  /* ... mais variáveis */
}
```

### Animações
Todas as animações respeitam a preferência do usuário por motion reduzido:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 📝 Notas Técnicas

### Limitações
- Máximo de 50MB por arquivo PDF
- Requer JavaScript habilitado
- Funcionalidade offline limitada (sem Service Worker)

### Melhorias Futuras Possíveis
- Anotações e marcações
- Busca de texto dentro do PDF
- Thumbnails de páginas
- Zoom dinâmico
- Impressão otimizada

## 🤝 Contribuindo

Este é um projeto de demonstração, mas melhorias são bem-vindas! Algumas áreas de interesse:
- Melhorias de performance
- Novas funcionalidades de acessibilidade
- Otimizações de animação
- Suporte para mais formatos

## 📄 Licença

Projeto de código aberto para fins educacionais e demonstração.

---

**Desenvolvido com ❤️ e tecnologias web modernas**
