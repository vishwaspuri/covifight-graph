const express=require('express')
const router=express.Router();
var neo4j = require('neo4j-driver');
var uuid = require('uuid')


// Driver setup
var driver = neo4j.driver("'bolt://3.83.18.124:34344", neo4j.auth.basic("neo4j", "selection-gases-chapter"));
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
            res.send({
                person: personArr
            })
        })
        .catch(function(error){
            console.log(error);
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
            res.send({
                providers: personArr
            })
        })
        .catch(function(error){
            console.log(error);
        });
});

// Route to add person
router.post('/add-person/', async (req,res)=>{
    const personID=req.body.id;
    await session
        .run('CREATE (n:Person{uuid: $personID, probability: 0}) RETURN n.name', { 
            personID: personID
        })
        .then((result)=>{
            res.redirect('/api/all-person/');
        })
        .catch((error)=>{
            console.log(error);
        });
});


// Route to add Provider
router.post('/add-provider/', async (req,res)=>{
    const providerID=req.body.id;
    await session
        .run('CREATE (n:Provider{uuid: $providerID}) RETURN n.name', {
            providerID: providerID
        })
        .then((result)=>{
            res.redirect('/api/all-provider/');
        })
        .catch((error)=>{
            console.log(error);
        });
});


// Connect Users
router.post('/connnect-users/', async (req,res)=>{
    const id_one=req.body.id_one;
    const id_two=req.body.id_two;
    const time_spent=Number(req.body.time_spent);
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
            console.log(error);
        });
});

// Connecting User and Provider
router.post('/connect-user-provider/', async (req,res)=>{
    const person_id=req.body.person_id;
    const provider_id=req.body.provider_id;
    const time_spent=Number(req.body.time_spent);
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
            console.log(error);
        });
});

// Connecting different users
router.post('/connect-multiple-users/', async (req, res) => {
    const person_id = req.body.id;
    const connections = req.body.connections;

    for (const connection of connections) {
        await session
            .run("MATCH (a:Person{uuid: $person1_id}),(b:Person{uuid: $person2_id}) MERGE (a)-[r:CONNECTED_WITH{time_spent: $time}]->(b)", {
                person1_id: person_id,
                person2_id: connection.Id,
                time: connection.time
            })
            .then((result) => {
                ;
            })
            .catch((error) => {
                console.log(error);
                res.status(400).send(error);
                return ;
            });
    }

    res.send({"message": "All connections are successfully created."})

})

// n closest nodes to a given node 
router.get('/close_relation/:id/:n', async (req, res) => {
    const id = req.params.id;
    const n = parseInt(req.params.n);

    await session
        .run("MATCH (a:{uuid: $id})-[*1...$n]->(c) RETURN DISTINCT c", {
            id: id,
            n: n
        })
        .then((result) => {
            console.log(result);
        })
        .catch((error) => {
            console.log(error)
        })
    
    res.send({"message": "completed"})
})

module.exports= router;