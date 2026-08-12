declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    UPLOADS: R2Bucket;
    ADMIN_EMAILS?: string;
  }
}
