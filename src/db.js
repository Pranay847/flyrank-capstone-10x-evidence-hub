import{DatabaseSync}from'node:sqlite';import{mkdirSync}from'node:fs';import{dirname}from'node:path';
export function openDatabase(path=':memory:'){if(path!==':memory:')mkdirSync(dirname(path),{recursive:true});const db=new DatabaseSync(path);db.exec(`
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,email TEXT NOT NULL UNIQUE,token_hash TEXT NOT NULL UNIQUE);
CREATE TABLE IF NOT EXISTS projects(id INTEGER PRIMARY KEY,user_id INTEGER NOT NULL,name TEXT NOT NULL,description TEXT NOT NULL,requirements_json TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 1,created_at TEXT NOT NULL,FOREIGN KEY(user_id) REFERENCES users(id));
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
CREATE TABLE IF NOT EXISTS evidence(id INTEGER PRIMARY KEY,project_id INTEGER NOT NULL,requirement_key TEXT NOT NULL,kind TEXT NOT NULL,proof TEXT NOT NULL,created_at TEXT NOT NULL,FOREIGN KEY(project_id) REFERENCES projects(id));
CREATE INDEX IF NOT EXISTS idx_evidence_project_requirement ON evidence(project_id,requirement_key);
CREATE TABLE IF NOT EXISTS jobs(id INTEGER PRIMARY KEY,project_id INTEGER NOT NULL,user_id INTEGER NOT NULL,state TEXT NOT NULL DEFAULT 'queued',attempts INTEGER NOT NULL DEFAULT 0,max_attempts INTEGER NOT NULL DEFAULT 3,idempotency_key TEXT NOT NULL UNIQUE,alert TEXT,result_json TEXT,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS cache(cache_key TEXT PRIMARY KEY,value_json TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS ai_costs(id INTEGER PRIMARY KEY,user_id INTEGER NOT NULL,project_id INTEGER NOT NULL,operation TEXT NOT NULL,input_units INTEGER NOT NULL,output_units INTEGER NOT NULL,microcents INTEGER NOT NULL,created_at TEXT NOT NULL);
`);return db;}
