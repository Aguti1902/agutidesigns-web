-- La comprobación «¿este negocio es mío?» sale de la API pública: vive en un esquema privado que solo usan las políticas.
create schema if not exists oficina_priv;
revoke all on schema oficina_priv from public, anon;
grant usage on schema oficina_priv to authenticated, service_role;

create or replace function oficina_priv.es_mio(p_negocio uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.of_negocios n
                 where n.id = p_negocio and lower(n.owner_email) = lower(auth.jwt() ->> 'email'));
$$;
revoke all on function oficina_priv.es_mio(uuid) from public, anon;
grant execute on function oficina_priv.es_mio(uuid) to authenticated, service_role;

drop policy of_departamentos_leer on public.of_departamentos;
drop policy of_departamentos_ajustar on public.of_departamentos;
drop policy of_consumo_leer on public.of_consumo;
drop policy of_actividad_leer on public.of_actividad;
drop policy of_conexiones_leer on public.of_conexiones;
drop policy of_agentes_leer on public.of_agentes;
drop policy of_conversaciones_leer on public.of_conversaciones;
drop policy of_mensajes_leer on public.of_mensajes;
drop policy of_conocimiento_leer on public.of_conocimiento;
drop policy of_conocimiento_crear on public.of_conocimiento;
drop policy of_conocimiento_borrar on public.of_conocimiento;

create policy of_departamentos_leer on public.of_departamentos for select to authenticated using (oficina_priv.es_mio(negocio_id));
create policy of_departamentos_ajustar on public.of_departamentos for update to authenticated using (oficina_priv.es_mio(negocio_id)) with check (oficina_priv.es_mio(negocio_id));
create policy of_consumo_leer on public.of_consumo for select to authenticated using (oficina_priv.es_mio(negocio_id));
create policy of_actividad_leer on public.of_actividad for select to authenticated using (oficina_priv.es_mio(negocio_id));
create policy of_conexiones_leer on public.of_conexiones for select to authenticated using (oficina_priv.es_mio(negocio_id));
create policy of_agentes_leer on public.of_agentes for select to authenticated using (oficina_priv.es_mio(negocio_id));
create policy of_conversaciones_leer on public.of_conversaciones for select to authenticated using (oficina_priv.es_mio(negocio_id));
create policy of_mensajes_leer on public.of_mensajes for select to authenticated using (oficina_priv.es_mio(negocio_id));
create policy of_conocimiento_leer on public.of_conocimiento for select to authenticated using (oficina_priv.es_mio(negocio_id));
create policy of_conocimiento_crear on public.of_conocimiento for insert to authenticated with check (oficina_priv.es_mio(negocio_id));
create policy of_conocimiento_borrar on public.of_conocimiento for delete to authenticated using (oficina_priv.es_mio(negocio_id));

drop function public.of_es_mio(uuid);
