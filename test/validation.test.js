import test from'node:test';import assert from'node:assert/strict';import{openDatabase}from'../src/db.js';import{EvidenceService,validateAnalysis}from'../src/service.js';
function setup(provider,budget){const db=openDatabase();const service=new EvidenceService(db,provider,budget);const alice=service.createUser('alice@example.test','alice-token');const bob=service.createUser('bob@example.test','bob-token');const project=service.createProject(alice,{name:'Proof Hub',description:'Audit',requirements:['API','auth']});return{db,service,alice,bob,project};}
const status=code=>e=>e.status===code;

test('createProject rejects missing fields, empty and blank requirements',()=>{const{service,alice}=setup();
assert.throws(()=>service.createProject(alice,{description:'d',requirements:['API']}),status(400));
assert.throws(()=>service.createProject(alice,{name:'n',description:'d',requirements:[]}),status(400));
assert.throws(()=>service.createProject(alice,{name:'n',description:'d',requirements:'API'}),status(400));
assert.throws(()=>service.createProject(alice,{name:'n',description:'d',requirements:['API','  ']}),/non-empty strings/);
assert.throws(()=>service.createProject(alice,{name:'n',description:'d',requirements:[42]}),status(400));});

test('addEvidence validates requirement, kind and proof, and bumps project version',()=>{const{service,alice,bob,project}=setup();
assert.throws(()=>service.addEvidence(alice,project.id,{requirement_key:'nope',kind:'test',proof:'x'}),status(422));
assert.throws(()=>service.addEvidence(alice,project.id,{requirement_key:'API',kind:'screenshot',proof:'x'}),status(400));
assert.throws(()=>service.addEvidence(alice,project.id,{requirement_key:'API',kind:'log',proof:''}),status(400));
assert.throws(()=>service.addEvidence(bob,project.id,{requirement_key:'API',kind:'log',proof:'x'}),status(404));
service.addEvidence(alice,project.id,{requirement_key:'API',kind:'curl',proof:'200 OK'});
assert.equal(service.project(alice,project.id).version,project.version+1);});

test('summary reports covered, missing and fractional completion',()=>{const{service,alice,project}=setup();
service.addEvidence(alice,project.id,{requirement_key:'API',kind:'test',proof:'a'});service.addEvidence(alice,project.id,{requirement_key:'API',kind:'log',proof:'b'});
const s=service.summary(alice,project.id);assert.deepEqual(s.covered,['API']);assert.deepEqual(s.missing,['auth']);assert.equal(s.completion,0.5);assert.equal(s.evidence.length,2);});

test('queueAudit requires a key and runJob hides other users\' jobs',async()=>{const{service,alice,bob,project}=setup();
assert.throws(()=>service.queueAudit(alice,project.id,''),status(400));
const job=service.queueAudit(alice,project.id,'k1');
await assert.rejects(()=>service.runJob(bob,job.id),status(404));
await assert.rejects(()=>service.runJob(alice,9999),status(404));});

test('budget overrun returns 429, records no cost, and leaves the job retryable',async()=>{const{db,service,alice,project}=setup(undefined,1);
const job=service.queueAudit(alice,project.id,'tiny-budget');
await assert.rejects(()=>service.runJob(alice,job.id),status(429));
assert.equal(db.prepare('SELECT COUNT(*) n FROM ai_costs').get().n,0);
const row=db.prepare('SELECT state,attempts,alert FROM jobs WHERE id=?').get(job.id);assert.equal(row.state,'queued');assert.equal(row.attempts,1);assert.equal(row.alert,null);});

test('validateAnalysis rejects non-string list items and passes valid output through',()=>{
assert.throws(()=>validateAnalysis(null),status(422));
assert.throws(()=>validateAnalysis({summary:'s',risks:[1],next_actions:[]}),status(422));
assert.throws(()=>validateAnalysis({summary:'s',risks:[],next_actions:[{}]}),status(422));
const ok={summary:'s',risks:['r'],next_actions:['a']};assert.equal(validateAnalysis(ok),ok);});
