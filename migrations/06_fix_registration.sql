-- Secure function to check subdomain availability without exposing tenant data
CREATE OR REPLACE FUNCTION public.check_subdomain_availability(p_subdomain TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (postgres/superuser)
AS $$
BEGIN
  -- Return TRUE if subdomain does NOT exist, FALSE if it does
  RETURN NOT EXISTS (
    SELECT 1 
    FROM public.tenants 
    WHERE subdomain = p_subdomain
  );
END;
$$;

-- Grant execute permission to public (anon) and authenticated users
GRANT EXECUTE ON FUNCTION public.check_subdomain_availability(TEXT) TO anon, authenticated, service_role;
