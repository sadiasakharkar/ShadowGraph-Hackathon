MERGE (i:Entity {id:'u:root', user_id:'demo-user'})
SET i.label='demoanalyst', i.node_type='identity', i.verified=true, i.suspicious=false;
MERGE (a:Entity {id:'a:mirror', user_id:'demo-user'})
SET a.label='demoanalyst_real', a.node_type='account', a.verified=false, a.suspicious=true;
MERGE (img:Entity {id:'i:avatar', user_id:'demo-user'})
SET img.label='Primary Avatar', img.node_type='image', img.verified=true, img.suspicious=false;
MATCH (i:Entity {id:'u:root', user_id:'demo-user'}), (a:Entity {id:'a:mirror', user_id:'demo-user'})
MERGE (i)-[:RELATED {relation:'username_similarity', score:0.84}]->(a);
MATCH (a:Entity {id:'a:mirror', user_id:'demo-user'}), (img:Entity {id:'i:avatar', user_id:'demo-user'})
MERGE (a)-[:RELATED {relation:'image_similarity', score:0.91}]->(img);
