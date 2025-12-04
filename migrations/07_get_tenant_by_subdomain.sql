-- Secure function to get tenant details by subdomain
CREATE OR REPLACE FUNCTION public.get_tenant_by_subdomain(p_subdomain TEXT)
RETURNS TABLE(id UUID, name TEXT, subdomain TEXT)
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (postgres/superuser)
AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.name, t.subdomain
  FROM public.tenants t
  WHERE t.subdomain = p_subdomain;
END;
$$;

-- Grant execute permission to public (anon) and authenticated users
GRANT EXECUTE ON FUNCTION public.get_tenant_by_subdomain(TEXT) TO anon, authenticated, service_role;
