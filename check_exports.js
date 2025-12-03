try {
    const middleware = require('@supabase/auth-helpers-nextjs/middleware');
    console.log('Found in middleware:', Object.keys(middleware));
} catch (e) {
    console.log('Not found in middleware subpath');
}
