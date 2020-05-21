const express=require('express')
const router=express.Router();
var neo4j = require('neo4j-driver');
var uuid = require('uuid')


// Driver setup
var driver = neo4j.driver("", neo4j.auth.basic("", ""));
var session = driver.session();


// Routes


// Get all persons 
router.get('/all-person/',async (req,res)=>{
    await session
        .run("MATCH (n:Person) RETURN n")
        .then(function(result){
            let personArr=[];
            result.records.forEach((record)=>{
                personArr.push({
                    id: record._fields[0].properties.uuid,
                    probability: record._fields[0].properties.probability        
                });
            });
            res.status(200).send({
                person: personArr
            })
        })
        .catch(function(error){
            res.status(500).send(error);
        });
});


// Get all providers 
router.get('/all-provider/',async (req,res)=>{
    await session
        .run("MATCH (n:Provider) RETURN n")
        .then(function(result){
            let personArr=[];
            result.records.forEach((record)=>{
                personArr.push({
                    id: record._fields[0].properties.uuid,  
                });
            });
            res.status(200).send({
                providers: personArr
            })
        })
        .catch(function(error){
            res.status(500).send(error);
        });
});

// Route to add person
router.post('/add-person/', async (req,res)=>{
    const personID=req.body.id;
    if (!req.body.id){
        res.status(403).send({'error':'Send person id!'})
    }
    await session
        .run('CREATE (n:Person{uuid: $personID, probability: 0}) RETURN n.name', { 
            personID: personID
        })
        .then((result)=>{
            res.status(200).send({
                'person':{
                    'uuid': personID
                }
            });
        })
        .catch((error)=>{
            res.status(500).send(error);
        });
});


// Route to add Provider
router.post('/add-provider/', async (req,res)=>{
    const providerID=req.body.id;
    if (!req.body.id){
        res.status(403).send({'error':'Send provider id!'})
    }
    await session
        .run('CREATE (n:Provider{uuid: $providerID}) RETURN n.name', {
            providerID: providerID
        })
        .then((result)=>{
            res.status(200).send({
                'provider':{
                    'uuid': providerID
                }
            });
        })
        .catch((error)=>{
            res.status(500).send(error);
        });
});


// Connect Users
router.post('/connnect-users/', async (req,res)=>{
    const id_one=req.body.id_one;
    const id_two=req.body.id_two;
    if (!id_one){
        res.status(403).send({'error':'User IDs not sent'})
    }
    if (!id_two){
        res.status(403).send({'error':'User IDs not sent'})
    }
    const time_spent=Number(req.body.time_spent);
    if (!time_spent){
        time_spent=0;
    }
    await session
        .run("MATCH (a:Person{uuid: $id_one}),(b:Person{uuid: $id_two}) MERGE (a)-[r:CONNECTED_WITH{time_spent: $time_spent}]->(b) RETURN a,b", {
            id_one: id_one,
            id_two: id_two,
            time_spent: time_spent 
        })
        .then((result)=>{
            res.redirect('/api/all-person/');
        })
        .catch((error)=>{
            res.status(500).send(error);
        });
});

// Connecting User and Provider
router.post('/connect-user-provider/', async (req,res)=>{
    const person_id=req.body.person_id;
    const provider_id=req.body.provider_id;
    const time_spent=Number(req.body.time_spent);
    if (!provider_id){
        res.status(403).send({'error':'Provider IDs not sent'})
    }
    if (!person_id){
        res.status(403).send({'error':'Person IDs not sent'})
    }
    if (!time_spent){
        time_spent=0;
    }
    await session
        .run("MATCH (a:Person{uuid: $person_id}),(b:Provider{uuid: $provider_id}) MERGE (a)-[r:WENT_TO{time_spent: $time_spent}]->(b)", {
            person_id: person_id,
            provider_id: provider_id,
            time_spent: time_spent
        })
        .then((result)=>{
            res.redirect('/api/all-provider/');
        })
        .catch((error)=>{
            res.status(500).send(error);
        });
});

// Mark user positive
router.post('/mark-positive/',(req,res)=>{
    const personID=req.body.id;
    if (!personID){
        res.status(403).send({'error':'Send person id!'})
    }
    session
        .run(
            'MATCH (a0:Person{uuid: $personID}) SET a0.probability=1 '
            +'WITH a0 '
            +'MATCH (a0)-[:CONNECTED_WITH*1]-(a1:Person) WHERE a1.probability<>1 '
            +'SET a1.probability=a1.probability+0.7-0.7*a1.probability '
            +'WITH a1 '
            +'MATCH (a1)-[:CONNECTED_WITH*1]-(a2:Person) WHERE a2.probability<>1 '
            +'SET a2.probability=a2.probability+0.4-0.4*a2.probability ',{
                personID: personID
            }
        ).then((result)=>{
            res.status(200).send({
                'msg': 'probabilities updated!'
            })
        })
        .catch((error)=>{
            console.log(error);
            res.status(500).send(error);
        });
});







module.exports= router;