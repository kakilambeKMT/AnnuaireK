import {HttpError} from './domain.js';

// Private one-to-one messaging between registered members of L'annuaire K.
// Routes (all require a signed-in, initialised member):
//   GET  /api/messaging/members?q=…                 search members to start a discussion
//   GET  /api/messaging/conversations               list my discussions
//   POST /api/messaging/conversations {userId}      open (or reuse) a discussion with a member
//   GET  /api/messaging/conversations/:id/messages  read a discussion (marks incoming messages as read)
//   POST /api/messaging/conversations/:id/messages {body}  send a message

const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const likeEscape=s=>s.replace(/[\\%_]/g,c=>'\\'+c);
const activityName=raw=>{try{return JSON.parse(raw).name||null}catch{return null}};

async function participant(db,id,user){
  const c=await db.prepare('SELECT * FROM k_conversations WHERE id=?').bind(id).first();
  if(!c||(c.user_a!==user.id&&c.user_b!==user.id))throw new HttpError(404,'Discussion introuvable.');
  return c;
}

export async function messagingAction(p,method,b,db,user,url){
  const now=new Date().toISOString();

  if(p==='/api/messaging/members'&&method==='GET'){
    const q=(url.searchParams.get('q')||'').trim().slice(0,100);
    if(q.length<2)return json({members:[]});
    const rows=(await db.prepare("SELECT u.user_id AS id,u.email,(SELECT a.data_json FROM k_activities a WHERE a.owner_id=u.user_id AND a.status='published' ORDER BY a.updated_at DESC LIMIT 1) AS activity FROM k_users u WHERE u.user_id<>? AND u.email ILIKE ? ORDER BY u.email LIMIT 8").bind(user.id,'%'+likeEscape(q)+'%').all()).results;
    return json({members:rows.map(r=>({id:r.id,email:r.email,name:r.activity?activityName(r.activity):null}))});
  }

  if(p==='/api/messaging/conversations'&&method==='GET'){
    const rows=(await db.prepare('SELECT c.id,c.updated_at,u.user_id AS other_id,u.email AS other_email,(SELECT m.body FROM k_messages m WHERE m.conversation_id=c.id ORDER BY m.created_at DESC LIMIT 1) AS preview,(SELECT COUNT(*) FROM k_messages m WHERE m.conversation_id=c.id AND m.sender_id<>? AND m.read_at IS NULL) AS unread FROM k_conversations c JOIN k_users u ON u.user_id=CASE WHEN c.user_a=? THEN c.user_b ELSE c.user_a END WHERE c.user_a=? OR c.user_b=? ORDER BY c.updated_at DESC LIMIT 100').bind(user.id,user.id,user.id,user.id).all()).results;
    return json({conversations:rows.map(r=>({id:r.id,other_id:r.other_id,other_email:r.other_email,preview:r.preview?String(r.preview).slice(0,90):'',unread:Number(r.unread)||0,updated_at:r.updated_at}))});
  }

  if(p==='/api/messaging/conversations'&&method==='POST'){
    const other=typeof b.userId==='string'?b.userId:'';
    if(!other||other===user.id)throw new HttpError(400,'Choisissez un autre membre.');
    const target=await db.prepare('SELECT user_id,email FROM k_users WHERE user_id=?').bind(other).first();
    if(!target)throw new HttpError(404,'Ce membre est introuvable.');
    const [a,c]=[user.id,other].sort();
    await db.prepare('INSERT INTO k_conversations(id,user_a,user_b,created_at,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(user_a,user_b) DO NOTHING').bind(crypto.randomUUID(),a,c,now,now).run();
    const row=await db.prepare('SELECT id FROM k_conversations WHERE user_a=? AND user_b=?').bind(a,c).first();
    return json({id:row.id,other_id:target.user_id,other_email:target.email});
  }

  const m=p.match(/^\/api\/messaging\/conversations\/([a-zA-Z0-9-]+)\/messages$/);
  if(m&&method==='GET'){
    const c=await participant(db,m[1],user);
    await db.prepare('UPDATE k_messages SET read_at=? WHERE conversation_id=? AND sender_id<>? AND read_at IS NULL').bind(now,c.id,user.id).run();
    const rows=(await db.prepare('SELECT * FROM (SELECT id,sender_id,body,created_at,read_at FROM k_messages WHERE conversation_id=? ORDER BY created_at DESC LIMIT 200) recent ORDER BY created_at ASC').bind(c.id).all()).results;
    return json({messages:rows});
  }
  if(m&&method==='POST'){
    const c=await participant(db,m[1],user);
    const text=typeof b.body==='string'?b.body.trim():'';
    if(!text||text.length>4000)throw new HttpError(400,'Votre message doit contenir entre 1 et 4 000 caractères.');
    const id=crypto.randomUUID();
    await db.batch([
      db.prepare('INSERT INTO k_messages(id,conversation_id,sender_id,body,created_at) VALUES(?,?,?,?,?)').bind(id,c.id,user.id,text,now),
      db.prepare('UPDATE k_conversations SET updated_at=? WHERE id=?').bind(now,c.id),
    ]);
    return json({id,created_at:now},201);
  }
  return null;
}
