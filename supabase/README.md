# Supabase — Santa Cruz Conecta

1. Crie um projeto Supabase **separado** para o portal.
2. Cole e execute `migrations/20261116000000_init_directory.sql` no SQL Editor (ou aplique como migração via fluxo da equipe).
3. Confirme os 37 registros na tabela `public.places` e as políticas de RLS.
4. Copie **apenas** o Project URL e a chave pública `sb_publishable_...` para `assets/supabase-config.js`.
5. Publique o commit no GitHub; Cloudflare Pages sincroniza os arquivos.

O site inicia usando `assets/data.js`; quando a configuração pública é preenchida, passa a ler estabelecimentos publicados do Supabase pela API REST. Se a API estiver indisponível, exibe o catálogo estático para evitar uma página vazia.

Apenas linhas `is_published = true` podem ser consultadas anonimamente. Não há inserção/edição anônima. Nenhuma chave `sb_secret_...` ou `service_role` deve estar no código público.

**Atenção:** este SQL ainda precisa ser aplicado ao projeto Supabase; versionar a migração no GitHub não executa a migração automaticamente.
