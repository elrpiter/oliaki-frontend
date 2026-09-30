# 📱 OLIAKI — Aplicativo Mobile & Web (Frontend)

Interface do usuário para a plataforma de marketplace hiperlocal **OLIAKI**, desenvolvida em **React Native** com suporte para dispositivos móveis (Android/iOS) e navegadores Web.

---

## 🛠️ Tecnologias & Bibliotecas

- **React Native** com **Expo**
- **TypeScript**
- **React Navigation** (Navegação via Stacks e Bottom Tabs)
- **Context API** (Gerenciamento de Estado Global para Autenticação e Carrinho)
- **Axios** (Integração com API RESTful)
- **React Native Web** (Compatibilidade com navegadores)

---

## 🔥 Funcionalidades do App

- 🔑 **Autenticação & Perfis:** Tela de login e cadastro com diferenciação de visões para Compradores e Vendedores (`BUYER` e `SELLER`).
- 🏪 **Módulo do Vendedor:** Cadastro de loja e gerenciamento de catálogo de produtos com definição de estoque.
- 🔍 **Feed Hiperlocal:** Busca em tempo real por produtos, nomes de lojas ou bairros.
- 🛒 **Carrinho de Compras Inteligente:** Trava em tempo real para impedir adicionar mais itens do que a quantidade disponível em estoque.
- 📦 **Checkout Flexível:** Seleção de modo de entrega (Retirada na Loja ou Entrega Local com endereço).
- 📋 **Painel de Pedidos:** Acompanhamento do status de compras pelo cliente e atualização de status em tempo real pelo vendedor (`Pendente` ➔ `Em Preparo` ➔ `Entregue` / `Cancelado`).

---

## 🚀 Como Executar o Projeto

### **1. Pré-requisitos**
- **Node.js** (v18 ou superior)
- **Expo Go** instalado no celular (para testar em dispositivo móvel) ou navegador web.

### **2. Instalação e Execução**

```bash
# Entrar na pasta do projeto
cd oliaki-frontend

# Instalar as dependências
npm install

# Iniciar o servidor de desenvolvimento do Expo
npx expo start
```

> **Dica para rodar na Web:** Após executar `npx expo start`, pressione a tecla **`w`** no terminal para abrir a aplicação no seu navegador.

---

## ⚙️ Repositório da API (Backend)

O frontend consome as rotas da API RESTful do OLIAKI. Para executar e integrar com o backend, consulte a documentação do repositório correspondente.

---

Developed by **Piter Elias Lourencini Rezende**