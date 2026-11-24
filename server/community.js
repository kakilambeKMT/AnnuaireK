import {HttpError,isModerator} from './domain.js';
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const text=(v,max,min=0)=>{if(typeof v!=='string'||v.trim().length<min||v.trim().length>max)throw new HttpError(400,'Un champ est manquant ou trop long.');return v.trim()};
const choice=(v,values)=>{if(!values.includes(v))throw new HttpError(400,'Choix invalide.');return v};
const counts=`(SELECT count(*) FROM k_community_reactions r WHERE r.post_id=p.id AND r.kind='concerned') AS concerned,(SELECT count(*) FROM k_community_reactions r WHERE r.post_id=p.id AND r.kind='test') AS testers,(SELECT count(*) FROM k_community_reactions r WHERE r.post_id=p.id AND r.kind='pay') AS payers`;
export async function community(path,method,b,db,user){
 const now=new Date().toISOString(),stmt=(sql,...args)=>db.prepare(sql).bind(...args);
 if(path==='/api/community/posts'&&method==='GET')return json({posts:(await stmt(`SELECT p.id,p.kind,p.title,p.description,p.display_name,p.city,p.country,p.category,p.details,p.created_at,${counts} FROM k_community_posts p WHERE status='published' ORDER BY created_at DESC LIMIT 300`).all()).results});
 if(!user)throw new HttpError(401,'Connectez-vous pour participer.');
 if(path==='/api/community/mine'&&method==='GET'){
  const balance=await stmt('SELECT 60+COALESCE(SUM(minutes),0) AS minutes FROM k_time_ledger WHERE user_id=?',user.id).first();
  const reserved=await stmt("SELECT COALESCE(SUM(minutes),0) AS minutes FROM k_time_sessions WHERE learner_id=? AND status IN ('requested','accepted')",user.id).first();
  return json({minutes:Number(balance.minutes),reserved:Number(reserved.minutes),posts:(await stmt('SELECT * FROM k_community_posts WHERE owner_id=? ORDER BY created_at DESC LIMIT 100',user.id).all()).results,sessions:(await stmt('SELECT s.*,p.title FROM k_time_sessions s JOIN k_community_posts p ON p.id=s.post_id WHERE provider_id=? OR learner_id=? ORDER BY s.created_at DESC LIMIT 100',user.id,user.id).all()).results,reactions:(await stmt('SELECT post_id,kind FROM k_community_reactions WHERE user_id=?',user.id).all()).results});
 }
 if(path==='/api/community/posts'&&method==='POST'){
  const kind=choice(b.kind,['exchange','need']),d=b.details||{};
  const details=kind==='exchange'?{minutes:Number(choice(Number(d.minutes),[30,60])),mode:choice(d.mode,['remote','local','both']),availability:text(d.availability,300,3)}:{frequency:choice(d.frequency,['daily','weekly','monthly','occasional']),currentSolution:text(d.currentSolution,500),impact:text(d.impact,300),budget:text(d.budget,100)};
  if(b.consent!==true)throw new HttpError(400,'Autorisez la publication de ces informations.');
  const total=await stmt('SELECT count(*) AS n FROM k_community_posts WHERE owner_id=?',user.id).first();if(Number(total.n)>=100)throw new HttpError(429,'Limite de 100 publications atteinte.');
  const id=crypto.randomUUID();await stmt('INSERT INTO k_community_posts(id,owner_id,kind,title,description,display_name,city,country,category,details,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)',id,user.id,kind,text(b.title,100,5),text(b.description,2000,20),text(b.displayName,60,2),text(b.city,80,2),text(b.country,80,2),text(b.category,80,2),JSON.stringify(details),now).run();return json({id,status:'pending'},201);
 }
 if(path==='/api/community/admin'&&method==='GET'){
  if(!isModerator(user))throw new HttpError(403,'Accès réservé à la modération.');
  return json({posts:(await stmt('SELECT * FROM k_community_posts ORDER BY created_at DESC LIMIT 300').all()).results,solutions:(await stmt('SELECT s.*,p.title FROM k_community_solutions s JOIN k_community_posts p ON p.id=s.post_id ORDER BY s.created_at DESC LIMIT 300').all()).results,reports:(await stmt('SELECT r.*,p.title FROM k_community_reports r JOIN k_community_posts p ON p.id=r.post_id ORDER BY r.created_at DESC LIMIT 300').all()).results});
 }
 if(path==='/api/community/review'&&method==='POST'){
  if(!isModerator(user))throw new HttpError(403,'Accès réservé à la modération.');
  const table=b.solution===true?'k_community_solutions':'k_community_posts',status=choice(b.status,['published','archived']),reason=text(b.reason,500,status==='archived'?3:0);
  const row=await stmt(`SELECT id FROM ${table} WHERE id=?`,String(b.id)).first();if(!row)throw new HttpError(404,'Publication introuvable.');
  await db.batch([stmt(`UPDATE ${table} SET status=?${b.solution===true?'':',reason=?'} WHERE id=?`,...b.solution===true?[status,row.id]:[status,reason,row.id]),stmt('INSERT INTO k_audit(id,actor_id,action,target_id,detail,created_at) VALUES(?,?,?,?,?,?)',crypto.randomUUID(),user.id,'community:'+status,row.id,reason,now)]);return json({ok:true});
 }
 if(path==='/api/community/session'&&method==='POST'){
  const s=await stmt('SELECT * FROM k_time_sessions WHERE id=?',String(b.id)).first();if(!s)throw new HttpError(404,'Séance introuvable.');
  if(![s.provider_id,s.learner_id].includes(user.id))throw new HttpError(403,'Cette séance est privée.');
  if(b.action==='accept'){
   if(user.id!==s.provider_id)throw new HttpError(403,'Seule la personne qui propose la séance peut accepter.');
   const r=await stmt("UPDATE k_time_sessions SET status='accepted' WHERE id=? AND status='requested'",s.id).run();if(!r.meta.changes)throw new HttpError(409,'Cette demande a déjà été traitée.');
  }else if(b.action==='cancel'){
   const r=await stmt("UPDATE k_time_sessions SET status='cancelled' WHERE id=? AND status IN ('requested','accepted') AND NOT provider_confirmed AND NOT learner_confirmed",s.id).run();if(!r.meta.changes)throw new HttpError(409,'Annulation impossible après confirmation. Contactez la modération en cas de désaccord.');
  }else if(b.action==='confirm'){
   if(!['accepted','completed'].includes(s.status))throw new HttpError(409,'La séance doit être acceptée avant confirmation.');
   const field=user.id===s.provider_id?'provider_confirmed':'learner_confirmed';
   await db.batch([stmt(`UPDATE k_time_sessions SET ${field}=true WHERE id=? AND status='accepted'`,s.id),stmt("INSERT INTO k_time_ledger(session_id,user_id,minutes) SELECT id,provider_id,minutes FROM k_time_sessions WHERE id=? AND status='accepted' AND provider_confirmed AND learner_confirmed UNION ALL SELECT id,learner_id,-minutes FROM k_time_sessions WHERE id=? AND status='accepted' AND provider_confirmed AND learner_confirmed ON CONFLICT DO NOTHING",s.id,s.id),stmt("UPDATE k_time_sessions SET status='completed' WHERE id=? AND status='accepted' AND provider_confirmed AND learner_confirmed",s.id)]);
  }else throw new HttpError(400,'Action inconnue.');return json({ok:true});
 }
 const match=path.match(/^\/api\/community\/posts\/([a-zA-Z0-9-]+)\/(reaction|solutions|request|withdraw|report)$/);
 if(match){const post=await stmt('SELECT * FROM k_community_posts WHERE id=?',match[1]).first();if(!post)throw new HttpError(404,'Publication introuvable.');const action=match[2];
  if(action==='withdraw'&&method==='POST'){if(post.owner_id!==user.id)throw new HttpError(403,'Cette publication ne vous appartient pas.');await stmt("UPDATE k_community_posts SET status='archived' WHERE id=?",post.id).run();return json({ok:true})}
  if(post.status!=='published')throw new HttpError(404,'Publication indisponible.');
  if(action==='solutions'&&method==='GET')return json({solutions:(await stmt("SELECT id,body,status,created_at FROM k_community_solutions WHERE post_id=? AND (status='published' OR owner_id=?) ORDER BY created_at DESC LIMIT 100",post.id,user.id).all()).results});
  if(method!=='POST')throw new HttpError(405,'Méthode refusée.');
  if(action==='reaction'){if(post.kind!=='need')throw new HttpError(400,'Réservé aux besoins.');const kind=choice(b.kind,['concerned','test','pay']);if(b.active===false)await stmt('DELETE FROM k_community_reactions WHERE post_id=? AND user_id=? AND kind=?',post.id,user.id,kind).run();else await stmt('INSERT INTO k_community_reactions(post_id,user_id,kind) VALUES(?,?,?) ON CONFLICT DO NOTHING',post.id,user.id,kind).run();return json({ok:true})}
  if(action==='solutions'){if(post.kind!=='need')throw new HttpError(400,'Réservé aux besoins.');const id=crypto.randomUUID();await stmt('INSERT INTO k_community_solutions(id,post_id,owner_id,body,created_at) VALUES(?,?,?,?,?)',id,post.id,user.id,text(b.body,2000,20),now).run();return json({id,status:'pending'},201)}
  if(action==='report'){await stmt('INSERT INTO k_community_reports(post_id,user_id,reason,created_at) VALUES(?,?,?,?) ON CONFLICT(post_id,user_id) DO UPDATE SET reason=EXCLUDED.reason,created_at=EXCLUDED.created_at',post.id,user.id,text(b.reason,500,5),now).run();return json({ok:true})}
  if(action==='request'){
   if(post.kind!=='exchange'||post.owner_id===user.id)throw new HttpError(400,'Choisissez la séance d’un autre membre.');
   const id=crypto.randomUUID(),minutes=post.details.minutes,objective=text(b.objective,500,10),appointment=text(b.appointment,200,5);
   const r=await db.batch([stmt('SELECT user_id FROM k_users WHERE user_id=? FOR UPDATE',user.id),stmt("INSERT INTO k_time_sessions(id,post_id,provider_id,learner_id,minutes,objective,appointment,created_at) SELECT ?,?,?,?,?,?,?,? WHERE 60+COALESCE((SELECT SUM(minutes) FROM k_time_ledger WHERE user_id=?),0)-COALESCE((SELECT SUM(minutes) FROM k_time_sessions WHERE learner_id=? AND status IN ('requested','accepted')),0)>=? ON CONFLICT DO NOTHING",id,post.id,post.owner_id,user.id,minutes,objective,appointment,now,user.id,user.id,minutes)]);
   if(!r[1].meta.changes)throw new HttpError(409,'Crédit-temps insuffisant ou demande déjà en cours pour cette offre.');return json({id},201);
  }
 }
 throw new HttpError(404,'Ressource communautaire introuvable.');
}
