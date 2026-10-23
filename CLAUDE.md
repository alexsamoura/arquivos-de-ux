# Arquivos de UX — instruções para o Claude

## Regra permanente de teste no navegador

O progresso de estudo da usuária (termos vistos e marcados para revisar) fica no
`localStorage`, na chave `glossario-ux:progresso`. É dado real. Abrir uma ficha
marca o termo como visto, e "Já sabia" / "Revisar depois" também gravam, então
qualquer teste que abra fichas altera esse progresso.

**Nunca alterar o progresso real sem ela pedir.** Antes de qualquer teste no
navegador, escolha uma das duas opções:

1. **Copiar e restaurar.** Antes do teste, salve uma cópia; ao final, restaure-a,
   mesmo que o teste falhe no meio:

   ```js
   // antes do teste
   sessionStorage.setItem("backup-progresso", localStorage.getItem("glossario-ux:progresso") ?? "__vazio__");

   // ao final do teste
   const backup = sessionStorage.getItem("backup-progresso");
   if (backup === "__vazio__") localStorage.removeItem("glossario-ux:progresso");
   else if (backup !== null) localStorage.setItem("glossario-ux:progresso", backup);
   sessionStorage.removeItem("backup-progresso");
   location.reload();
   ```

   Confira depois que a contagem de registros voltou ao valor de antes.

2. **Testar numa aba anônima**, ou em outra aba sem o progresso dela, onde o
   `localStorage` é separado e descartado.

Se um teste alterar o progresso real por engano, avise, mostre o que mudou e
pergunte antes de desfazer. Não "corrija" sozinho.
