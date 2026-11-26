# Cursos do Prof. Wesley Mendes

Plataforma de cursos (Geografia, Sociologia e Filosofia). Site no Firebase Hosting, login com Google e progresso no Firestore.

- Aluno: entra com Google, salva o próprio progresso.
- Professor: o e-mail definido em `PROF_EMAIL` (firebase-config.js) vê o painel de alunos e publica avisos.
- Regras de segurança: `firestore.rules`. Aluno lê e grava só o próprio documento.

## Colocar no ar (uma vez)

1. **Firebase:** criar um projeto novo (separado do cadastro da Irmandade). Registrar um app Web. Authentication › Sign-in method › Google: ativar. Firestore Database: criar (São Paulo, modo produção). Hosting: iniciar.
2. **Configuração:** colar o `firebaseConfig` em `firebase-config.js`.
3. **Conta de serviço:** Configurações do projeto › Contas de serviço › Gerar nova chave privada. Não coloque o `.json` no repositório.
4. **Secrets do GitHub:** `FIREBASE_PROJECT_ID` e `FIREBASE_SERVICE_ACCOUNT` (conteúdo inteiro do `.json`). Depois apague o `.json` baixado.
5. **Publicar:** Actions › Publicar no Firebase › Run workflow.
6. **Domínio autorizado:** Authentication › Configurações › Domínios autorizados: conferir se `<projectId>.web.app` está na lista.
7. Abrir `https://<projectId>.web.app` e entrar com o e-mail do professor.

O link para o aluno é o `https://<projectId>.web.app`.

## Atualizar o conteúdo

O `index.html` é gerado a partir dos materiais. Para atualizar, substituir o `index.html` e enviar para `main`.
