var CryptoJS = require('crypto-js')
var EC = require('elliptic').ec
var ec = new EC('secp256k1')
const { NONAME } = require('dns')
var express = require('express')
var url = require('url')
var cryptico = require('cryptico')
var app = express()
var MongoClient = require('mongodb').MongoClient
var cors = require('cors')
var mongoose = require('mongoose')
const { isNumberObject } = require('util/types')
const { time } = require('console')
const CONNECTION_URL = 'mongodb://127.0.0.1:27017/'
const PORT = 5000

class transaction{
    constructor(key, from, to, amount, timestamp, type) {
        this.from = from
        this.to = to
        this.amount = amount
        this.fee = type==0?amount*0.01:0
        this.timestamp = timestamp
        this.id = this.hash()
        this.type = type //0->normal 1->fee transaction
        this.signature = type==0?this.sign(key ,from, to, amount, this.fee, timestamp):'0'.repeat(60)
        this.status = 0 // 0->pending 1->confirmed -1->invalidated
    }
    hash = () => {
        return CryptoJS.SHA256(this.from + this.to + this.amount.toString() + this.fee.toString() + this.timestamp.toString()).toString()
    }
    sign = (key ,from, to, amount, fee, timestamp)=>{
        const signingKey = ec.keyFromPrivate(key,'hex')
        const hashtx = CryptoJS.SHA256(from + to + amount.toString() + fee.toString() + timestamp.toString()).toString()
        return signingKey.sign(hashtx,'base64').toDER('hex')
    }
    verify = (publicKey, signature)=>{
        return ec.verify(ec.keyFromPublic(publicKey), signature)
    }
}

class pool{
    constructor(){
        this.pool = new Array()
    }
    add_transaction = (tx)=>{
        MongoClient.connect(CONNECTION_URL,(err,client)=>{
            if(err) throw err
            var col = client.db('Blockchain').collection('pool')
            col.insertOne({_id:tx.id,from:tx.from,to:tx.to,amount:tx.amount,fee:tx.fee,timestamp:tx.timestamp,signature:tx.signature,status:tx.status})
            .then(()=>{
                client.close()
            })
        })
    }
    remove_transactions = (id) => {
        MongoClient.connect(CONNECTION_URL,(err,client)=>{
            if(err) throw err 
            var col = client.db('Blockchain').collection('pool')
            col.deleteOne({_id:id}).then(()=>client.close())
        })
    }
    isValid = (tx)=>{
        try{
            if(this.verify(tx.from,tx.signature, tx._id))
            {
                balances[tx.from] = balances[tx.from] - Number(tx.amount) - Number(tx.fee)
                if(balances[tx.from] >= 0)
                {
                    if(tx.to in balances)
                        return 1
                    else 
                        return 0
                }
                else{
                    return 0
                }
            }
            else{
                balances[tx.from] = balances[tx.from] + Number(tx.amount) + Number(tx.fee)
                return 0
            }
            }
            catch{
                return 0
            }
    }
    hash = (transaction) => {
        return CryptoJS.SHA256(transaction.from + transaction.to + transaction.amount.toString() + transaction.fee.toString() + transaction.timestamp.toString()).toString()
    }
    sign = (key ,from, to, amount, fee, timestamp)=>{
        const signingKey = ec.keyFromPrivate(key,'hex')
        const hashtx = CryptoJS.SHA256(from + to + amount.toString() + fee.toString() + timestamp.toString()).toString()
        return signingKey.sign(hashtx,'base64').toDER('hex')
    }
    verify = (publicKey, signature, id)=>{
        var public_ = ec.keyFromPublic(publicKey,'hex')
        return public_.verify(id, signature)
    }
}

class block{
    constructor(index, signature, validator,timestamp, prev_hash, transactions){
        this.index = index
        this.validator = validator
        this.timestamp = timestamp
        this._id = this.partial_hash()
        this.signature =  signature
        this.prev_hash = prev_hash
        this.hash = CryptoJS.SHA256(index.toString() + validator.toString() + this.timestamp.toString() + JSON.stringify(this.transactions) + prev_hash).toString()
        this.transactions = transactions
        this.valid = 1
        this.not_valid = 0
        this.voted_for = {}
        this.voted_against = {}
        this.status = 0 //0->pending 1->approved -1->invalidated 2->put to vote
        this.voted_for[this.validator] = 1
    }
    // add_transactions = ()=>{
    //     var limit = 4
    //     for(var i = 0; i<limit; i++)
    //     {
    //         this.transactions.push(Mempool.get_next_transaction())
    //     }
    // }
    partial_hash = ()=>{
        return CryptoJS.SHA256(this.timestamp.toString() + JSON.stringify(this.transactions)).toString()
    }

    remove_transactions = () => {
        if(this.transactions)
        this.transactions.forEach((transaction)=>{
            Mempool.pool.add_transaction(transaction)
        })
    }
}

class node{
    constructor(id, password) {
        this.id = id
        this.private_key = this.generate_private_key() 
        this.password = password
        //this.wallets = new Array()
        this.type = 1 // 1->normal 2->validator 3->miner
        this.balance = 0.00
        this.stake = 0.00
        this.coin_age = 10
    }
    generate_private_key = ()=>{
        const keyPair = ec.genKeyPair()
        this.public_key = keyPair.getPublic('hex').toString()
        return keyPair.getPrivate('hex').toString()
    }
}

class blockchain
{
    constructor(){
        this.index = 1
        this.prev_hash = '0'.repeat(256)
        this.no_of_users = 0
        this.no_of_validators = 0
        this.validator_threshold = 0.25
        this.stake_threshold = 5
        this.max_threshold = 50
        this.array_validators = new Array()
    }
    hash = (block)=>{
        return CryptoJS.SHA256(block.index.toString() + block.validator.toString() + block.timestamp.toString() + JSON.stringify(block.transactions) + block.prev_hash).toString()
    }
    add_user = (id, password)=>{
        var nod = new node(id,password)
        this.no_of_users += 1
        MongoClient.connect('mongodb://127.0.0.1:27017/',(err,client)=>{
            if(err) throw err 
            var col = client.db('Blockchain').collection('users')
            col.insertOne({_id:nod.public_key,public_key:nod.public_key,private_key:nod.private_key,password:nod.password,id:nod.id,balance:nod.balance,stake:nod.stake,type:nod.type,coin_age:nod.coin_age})
            .then(()=>{client.close();
            balances[nod.public_key] = nod.balance})
        })
        return nod
    }
    remove_user = (public_key)=>{
        MongoClient.connect('mongodb://127.0.0.1:27017/',(err,client)=>{
            if(err) throw err 
            var col = client.db('Blockchain').collection('users')
            col.deleteOne({_id:public_key}).then(()=>{this.no_of_users -= 1; client.close()})
        })
    }
    // add_validator = (key,stake) => {
    //     if(this.no_of_validators < this.no_of_users*this.validator_threshold &&  Number(stake) >= this.stake_threshold && Number(stake) <= this.max_threshold)
    //     {
    //         if(this.nodes[key].balance - Number(stake) > 0)
    //         {
    //             this.nodes[key].balance -= Number(stake)
    //             this.nodes[key].stake += Number(stake) 
    //             this.nodes[key].type = 2
    //             this.validators[key] = this.nodes[key]
    //             this.no_of_validators += 1
    //             //to be discussed
    //             if(this.no_of_validators == 1)
    //                 this.nodes[key].type = 3
    //             return this.nodes[key]
    //         }
    //         return null
    //     }
    //     return null
    // }
    remove_validator = (key)=> {
        MongoClient.connect(CONNECTION_URL,(err,client)=>{
            if(err) throw err 
            var col = client.db('Blockchain').collection('users')
            col.findOne({_id:key},(err,doc)=>{
                if(err) throw err 
                var new_bal = Number(doc.balance) + Number(doc.stake)
                col.updateOne({_id:key},{$set:{balance:new_bal, stake: 0, type: 1}}).then(()=>{
                    client.close()
                })
            })
        })
    }
    vote = (validator_key, validator_vote, hash) => {
        if(this.nodes[validator_key].type > 1)
        {
            this.pending.forEach((block)=>{
                if(block.hash == hash && !block.voted.has(validator_key))
                {
                    if(validator_vote == 1)
                        block.valid += 1
                    else
                        block.invalid += 1
                    block.voted.add(validator_key)
                    this.update_chain()
                }
            })
        }
    }
    validate = (transactions)=>{
        
        transactions.forEach((tx)=>{
            if(!(tx.from in balances))
                balances[tx.from] = this.nodes[tx.from].balance
        })
        transactions.forEach((tx)=>{
            if(Mempool.verify(tx.from,tx.signature, tx.id) || tx.type == 1)
            {
                balances[tx.from] = balances[tx.from] - Number(tx.amount) - Number(tx.fee)
                if(balances[tx.from] >= 0)
                {
                    if(tx.to in this.nodes)
                        result_array.push(1)
                    else 
                        result_array.push(0)
                }
                else 
                    result_array.push(0)
            }
            else
                result_array.push(0)
        })
        return result_array
    }

    validate_blocks = (hash) => {
        this.pending.forEach((block)=>{
            if(block.hash == hash)
            {
                return this.validate(block.transactions)
            }
        })
    }

    get_pending_blocks = (validator_key)=>{
        var pending = new Array()
        this.pending.forEach((block)=>{
            if(!block.voted.has(validator_key))
            {
                pending.push(block)
            }
        })
        return pending
    }

    add_block = (signature, validator, timestamp, transactions)=>{
        
    }
    remove_block = (hash)=>{
        this.pending.forEach((block,i)=>{
        if(block.hash == hash)
            {
                block.remove_transactions()
                this.pending.splice(i,1)
            }
        })
    }
    update_chain = ()=>{
        var threshold = Math.ceil(0.51*this.no_of_validators)
        this.pending.forEach((block)=>{
            if(block.valid >= threshold)
            {
                this.chain.push(block)
                this.pending.forEach((b,i)=>{
                    if(b.index == block.index)
                        this.pending.splice(i,1)
                })
                this.update_funds(block.transactions)
                this.index += 1
            }
        })
    }
    update_funds = (transactions)=>{
        console.log(typeof(transactions))
        if(transactions)
        transactions.forEach((tx)=>{
            try{
            if(tx.type != 1)
            {
                MongoClient.connect(CONNECTION_URL,(err,client)=>{
                    if(err) throw err 
                    balances[tx.from] = balances[tx.from] - Number(tx.amount) - Number(tx.fee)
                    var col = client.db('Blockchain').collection('users')
                    col.findOneAndUpdate({public_key:tx.from},{$set: {balance: balances[tx.from]}}).then(()=>client.close())
                })
                console.log("reached here")
                MongoClient.connect(CONNECTION_URL,(err,client)=>{
                    if(err) throw err 
                    var col = client.db('Blockchain').collection('users')
                    balances[tx.to] = balances[tx.to] + Number(tx.amount)
                    col.findOneAndUpdate({public_key:tx.to},{$set: {balance: balances[tx.to]}}).then(()=>client.close())
                })
            }
            else{
                console.log("reached here too")
                MongoClient.connect(CONNECTION_URL,(err,client)=>{
                    if(err) throw err 
                    var col = client.db('Blockchain').collection('users')
                    balances[tx.to] = balances[tx.to] + Number(tx.amount)
                    col.updateOne({public_key:tx.to},{$set: {balance: balances[tx.to]}}).then(()=>client.close())
                })
            }
            }
            catch{
                console.log('User doesn\'t exist')
            }
        })
    }

    return_validators_list = ()=>{
        return this.array_validators
    }

    set_forger = () => { // this function will return the details of the forger
        /*
        var total = 0; // this is the normalization factor for the weights
        // this for loop is to calculate the normalization factor and to create an array from the set
        for (var key in this.validators) {
            total += this.validators[key].stake * this.validators[key].coin_age
            this.array_validators.push(this.validators[key])
        }
        
        var weights = [] // this array will store all the weights of the validators for sampling
        for (var key in this.array_validators) {
            weights.push((this.array_validators[key].stake * this.array_validators[key].coin_age / total))
        }
        function weightedRandom(prob) {
            var i, sum = 0, r = Math.random();
            for (i = 0; i < prob.length; ++i) {
                sum += prob[i];
                if (r <= sum) {
                    return i
                }
            }
        }
        var index = weightedRandom(weights) // get the index of the forger
        console.log(this.array_validators)
        var key_to_look_for = this.array_validators[index].public_key; // this variable stores the required key so that we can the user's type
        for (var key in this.nodes) {
            if (this.nodes[key].public_key == key_to_look_for) {
                this.nodes[key].type = 3
            } 
        }
        // this is the select forger
        return this.array_validators[index].public_key
        */
        var validators;
        function weightedRandom(prob) {
        var i, sum = 0, r = Math.random();
        for (i = 0; i < prob.length; ++i) {
                sum += prob[i];
                if (r <= sum) {
                    return i
                }
            }
        }
        MongoClient.connect(CONNECTION_URL, function (err, client) {
            if (err) throw err;
            var dbo = client.db('Blockchain')
            dbo.collection('users').find({$or:[{type:2},{type:3}]}).toArray(function (err, result) {
                if (err) throw err;
                validators = result;
                var total = 0; // this is the normalization factor for the weights
                var weights = []
                // calculating the normalization factor
                validators.forEach(function (validator) {
                    total += (validator.stake * validator.coin_age)
                })
                // populating the weights array
                validators.forEach(function (validator) {
                    weights.push(validator.stake * validator.coin_age / total)
                })
                var index = weightedRandom(weights)
                console.log(validators)
                var key_to_look_for = validators[index].public_key
                // first we set the old forger to a validator
                // then we make the newly chosen validator a forger
                dbo.collection('users').updateOne({'type' : 3}, {$set : {'type' : 2}}).then(() => {
                    dbo.collection('users').updateOne({public_key : key_to_look_for}, {$set : {'type' : 3}}).then(() => {
                        console.log("new forger chosen")
                        client.close() // if any errors pop up, remove this line
                    })
                })
            })
        })
    }
    penalize_voters = (voters_public_keys) => {
        // voters_public_keys is a set of public keys
        MongoClient.connect(CONNECTION_URL, function (err, client) {
            if (err) throw err;
            var dbo = client.db('Blockchain')
            var public_key
            for (public_key in voters_public_keys) {
                dbo.collection('users').findOne({'public_key' : public_key}, function (err, result) {
                    if (err) throw err
                    if (result) {
                        var new_stake = result.stake / 2
                        var change_type = false
                        if (new_stake < 5) {
                            change_type = true
                        }
                        if (change_type == true) {
                            balances[result.public_key] += new_stake
                            dbo.collection('users').updateOne({'public_key' : result.public_key}, {$set : {'balance': balances[result.public_key],'stake' : 0, 'type' : 1}}).then(() => {
                                if(Number(result.type) == 3) 
                                    Blockchain.set_forger()
                                Blockchain.no_of_validators -= 1
                                console.log("stake and type changed")
                            })
                        }
                        else {
                            dbo.collection('users').updateOne({'public_key' : result.public_key}, {$set : {'stake' : new_stake}}).then(() => {
                                console.log('stake changed')
                            })
                        }
                    }
                }) 
            }
        })
    }
    update_transactions = (transactions) => {
        MongoClient.connect(CONNECTION_URL, function (err, client) {
            if (err) throw err
            var dbo = client.db('Blockchain')
            transactions.forEach(function (transaction) {
                if (transaction.type != 1) {
                    dbo.collection('pool').findOneAndUpdate({'_id' : transaction._id}, {$set : {'status' : 1}}).then(() => {
                        console.log('Transaction status updated')
                    })
                }
            })
        })
    }
    put_to_vote = (transactions)=>{
        MongoClient.connect(CONNECTION_URL,(err,client)=>{
            if(err) throw err
            transactions.forEach((tx)=>{
                client.db('Blockchain').collection('pool').findOneAndUpdate({_id:tx._id},{$set :{status : 2}})
            })
        })
    }

}

var app = express()
app.use(express.json());
app.use(express.urlencoded());
const Blockchain = new blockchain()
const Mempool = new pool()
var balances = {}
//Account creation

MongoClient.connect(CONNECTION_URL, (err,client)=>{
    if(err) throw err 
    client.db('Blockchain').collection('users').find({}).toArray((err,val)=>{
        val.forEach((v)=>{
            Blockchain.no_of_users += 1
            if(v.type != 1)
                Blockchain.no_of_validators += 1
            balances[v.public_key] = v.balance
        })
        console.log(Blockchain.no_of_users)
    })
    client.db('Blockchain').collection('chain').insertOne({_id:'0'.repeat(256),timestamp:Date.now(),prev_hash:'0'.repeat(256),index:0,status:1,hash:'0'.repeat(256),transactions:[]},(err,doc)=>{
        if(err) console.log()
        client.db('Blockchain').collection('chain').find({status:1}).toArray((err,docs)=>{
            if(err) client.close() 
            console.log(docs)
            Blockchain.index = docs.length
            docs.forEach((doc)=>{
                if(doc.index == Blockchain.index-1)
                    Blockchain.prev_hash = doc.hash
            })
            client.close()
            console.log(Blockchain.index,Blockchain.prev_hash)
        })
    })
    
})


app.post('/signup', (req, res) => {
    console.log(req.body)
    if(Blockchain.add_user(req.body.email, req.body.password))
        res.send({'message':'Successful!'})
    else 
    {
        res.status(500)
        res.send({'message':'Internal Server Error'})
    }
    
})
app.post('/login', (req, res) => {
    MongoClient.connect(CONNECTION_URL,(err,client)=>{
        if(err) throw err
            var col = client.db('Blockchain').collection('users')
            col.findOne({id:req.body.email,password:req.body.password},(err,docs)=>{
                if(!docs) res.send({'Message':'Invalid Login credentials!'})
                else res.send({'Message':'Login Successful!',wallets:docs, success:1})
            })
    }) 
})

app.post('/chose_wallet',(req,res)=>{
    MongoClient.connect(CONNECTION_URL,(err,client)=>{
        if(err) throw err
        var col = client.db('Blockchain').collection('users')
        col.findOne({id: req.body.id}, (err, docs)=>{
            if(!docs) res.send({'Message':'User does not exist'})
            else res.send({'public_key': docs._id, 'Message':""})
        })
    })
})

app.post('/create_transaction',(req,res)=>{
    MongoClient.connect(CONNECTION_URL,(err,client)=>{
        if(err) throw err
        var tx = new transaction(req.body.key, req.body.from, req.body.to, Number(req.body.amount), req.body.timestamp,0)
        var col = client.db('Blockchain').collection('pool')
        col.insertOne({_id:tx.id,from:tx.from,to:tx.to,amount:tx.amount,fee:tx.fee,timestamp:tx.timestamp,signature:req.body.signature,status:tx.status,type:0})
        .then(()=>{
            client.close()
            res.send({'Message':'Transaction added successfully'})
        })
    })
})

app.post('/get_pool',(req,res)=>{
    MongoClient.connect(CONNECTION_URL,(err,client)=>{
        if(err) throw err
        var dbo = client.db('Blockchain')
        dbo.collection('users').findOne({_id:req.body.public_key}, (err,doc)=>{
            if(doc && doc.type == 3)
                dbo.collection('pool').find({status:0}).toArray((err,docs)=>{
                    if(err) throw err 
                    client.close()
                    res.send({'Pool':docs})
                })
            else{
                res.send({'Message':'You are not a miner','Pool':[]})
                client.close()
            }
            })
        })
})

app.get('/get_chain',(req,res)=>{
    MongoClient.connect(CONNECTION_URL, (err,client)=>{
        var col = client.db('Blockchain').collection('chain')
        col.find({status:1}).toArray((err,docs)=>{
            client.close()
            if(err) res.send({'Message':'No blocks yet!!'})
            res.send({'Message':'Successful!','Blocks':docs})
        })
    })
})

app.post('/get_block_details', (req, res) => {
    console.log("inside /get_block_details", req.body)
    MongoClient.connect(CONNECTION_URL, function (err, client) {
        if (err) throw err
        var dbo = client.db('Blockchain')
        dbo.collection('chain').findOne({_id : req.body.id}, function (err, result) {
            if (err) throw err
            if (result) {
                res.send({"transactions" : result.transactions})
            }
        })
    })
})

app.post('/get_pending_blocks',(req,res)=>{
    MongoClient.connect(CONNECTION_URL,(err,client)=>{
        if(err) throw err
        client.db('Blockchain').collection('chain').find({status:0}).toArray((err,docs)=>{
            res.send({'Blocks':docs})
            client.close()
        })
    })
})

app.post('/getTrans', (req,res)=>{
    res.send({'transactions':Blockchain.create_block()})
})

app.post('/invalidate_transaction', (req, res) => {
    // req.body.id is a transaction id
    // set the status of that particular transaction to -1
    MongoClient.connect(CONNECTION_URL, function (err, client) {
        if (err) throw err
        var dbo = client.db('Blockchain')
        dbo.collection('pool').findOneAndUpdate({'_id' : req.body.id}, {$set : {'status' : -1}}).then(() => {
            res.send({'Message':"Transaction Invalidated"})
            client.close()
        })
    })
})

app.get('/transaction_history', (req, res) => {
    MongoClient.connect(CONNECTION_URL, function (err, client) {
        if (err) throw err
        var dbo = client.db('Blockchain')
        dbo.collection('pool').find({'status' : 1}).toArray(function (err, results) {
            if (err) throw err
            if (results) {
                res.send({'history' : results})
            }
            else {
                res.send("No approved transactions in the pool")
            }
            client.close()
        })
    })
})


app.get('/get_validators',(req, res)=>{
    MongoClient.connect(CONNECTION_URL, function (err, client) {
        if (err) throw err
        var dbo = client.db('Blockchain')
        dbo.collection('users').find({$or : [{type: 2}, {type : 3}]}).toArray(function (err, results) {
            if (err) throw err
            if (results) {
                res.send({'validators' : results})
            }
            else {
                res.send('No validators')
            }
        })
    })
})


app.post('/get_more',(req,res)=>{
    MongoClient.connect(CONNECTION_URL,(err,client)=>{
        if(err) throw err
        var reward = Math.random()*10
        var col = client.db('Blockchain').collection('users')
        col.findOne({_id:req.body.public_key},(err,doc)=>{
            if(err) throw err
            var balance = doc.balance + reward
            col.updateOne({_id:req.body.public_key}, {$set: {balance:balance}}).then(()=>{
                client.close();
                balances[req.body.public_key] += reward;
                res.send({'Message':('Hurray!you received a reward of '+reward+' coins'), balance:balance, stake:doc.stake, type: doc.type})
            })
        })
    })
})

app.post('/validateTrans', (req, res) => {
    var result_array = new Array()
    var bal = {}
    for(i in balances)
        bal[i] = balances[i]
    req.body.tList.forEach((tx)=>{
        try{
            console.log(req.body)
        if(Mempool.verify(tx.from,tx.signature, tx._id))
        {
            console.log(balances[tx.from])
            bal[tx.from] = bal[tx.from] - Number(tx.amount) - Number(tx.fee)
            console.log(bal[tx.from])
            if(bal[tx.from] >= 0)
            {
                if(tx.to in balances)
                    result_array.push(1)
                else 
                    result_array.push(0)
            }
            else{
                result_array.push(0)
            }
        }
        else{
            result_array.push(0)
            bal[tx.from] = bal[tx.from] + Number(tx.amount) + Number(tx.fee)
        }
        }
        catch{
            if(tx.type == 1)
                result_array.push(1)
        }
    })
    res.send({"valid_or_not" : result_array})
})

app.post('/add_block', (req, res) => {
    MongoClient.connect(CONNECTION_URL,(err,client)=>{
        if(err) throw err 
        client.db('Blockchain').collection('users').findOne({_id:req.body.public_key},(err,doc)=>{
            if(err) throw err 
            if(doc){
            var col = client.db('Blockchain').collection('chain')
        var new_block = new block(Blockchain.index,req.body.signature,req.body.public_key,req.body.timestamp,Blockchain.prev_hash,req.body.selectedTrans)
        var transactions = new_block.transactions
        transactions.forEach((tx)=>{
            new_block.transactions.push(new transaction(tx.from,tx.from,new_block.validator,tx.fee,new_block.timestamp,1))
        })
        console.log('1',new_block.transactions)
        if(new_block.valid>=Math.ceil(Blockchain.no_of_validators*0.51) || new_block.valid == Blockchain.no_of_validators){
            col.insertOne({_id:new_block._id,index:new_block.index,validator:new_block.validator,timestamp:new_block.timestamp,
                        signature:new_block.signature,transactions:new_block.transactions,valid:new_block.valid,invalid:new_block.not_valid,
                        voted_for:new_block.voted_for,voted_against:new_block.voted_against,status:1,hash:new_block.hash,prev_hash:new_block.prev_hash})
            .then(()=>{
                //client.close()
                Blockchain.index += 1
                Blockchain.prev_hash = new_block.hash
                Blockchain.update_transactions(new_block.transactions)
                Blockchain.update_funds(new_block.transactions)
                res.send({"Message":"Success"})
            })
        }
        else
            col.insertOne({_id:new_block._id,index:new_block.index,validator:new_block.validator,timestamp:new_block.timestamp,
                signature:new_block.signature,transactions:new_block.transactions,valid:new_block.valid,invalid:new_block.not_valid,
                voted_for:new_block.voted_for,voted_against:new_block.voted_against,status:0,hash:new_block.hash,prev_hash:new_block.prev_hash})
            .then(()=>{
                Blockchain.put_to_vote(new_block.transactions)
                res.send({"Message":"Success"})
            })
            Blockchain.set_forger()     
        } 
        else{
            res.send({'Message':'You are not a miner'})
            client.close()
        }
        })
    })
})

app.post('/get_signature',(req,res)=>{
    var timestamp = Date.now()
    res.send({'Message':'Signature generated!','signature':ec.keyFromPrivate(req.body.private_key, 'hex').sign(CryptoJS.SHA256(Blockchain.index + req.body.public_key + timestamp.toString()).toString(), 'base64').toDER('hex'),
                'timestamp':timestamp})
})

app.post('/get_signature_transaction',(req,res)=>{
    var timestamp = Date.now()
    res.send({'Message':'Signature generated!','signature':Mempool.sign(req.body.private_key,req.body.public_key,req.body.to,req.body.amount,
                (Number(req.body.amount)*0.01).toString(),timestamp),
                'timestamp':timestamp})
})

app.post('/votes', (req, res) => {
    MongoClient.connect(CONNECTION_URL,(err,client)=>{
        var col = client.db('Blockchain').collection('chain')
        col.findOne({_id:req.body._id}, (err,doc)=>{
            if(!doc && req.body.public_key in doc.voted_for) res.send({'Message':'You have already voted!'})
            else{
            if(err) res.send({'Message':'Invalid!'})
            else{
                if(req.body.vote == 1)
                {
                    doc.voted_for[req.body.public_key] = 1
                    doc.valid += 1
                    if(doc.valid>=Math.ceil(Blockchain.no_of_validators*0.51) || doc.valid == Blockchain.no_of_validators)
                    {
                        doc.status = 1
                        doc.prev_hash = Blockchain.prev_hash
                        doc.index = Blockchain.index
                        doc.hash = Blockchain.hash(doc)
                        Blockchain.index += 1
                        Blockchain.prev_hash = doc.hash
                        Blockchain.update_transactions(doc.transactions)
                        Blockchain.update_funds(doc.transactions)
                        col.findOneAndUpdate({_id:doc._id},{$set: {voted_for:doc.voted_for,voted_against:doc.voted_against,
                            valid:doc.valid,invalid:doc.invalid,status:doc.status,prev_hash:doc.prev_hash,index:doc.index,hash:doc.hash}},(err,doc)=>{
                            //client.close()
                        })
                    }    
                }
                else
                {
                    doc.voted_against[req.body.public_key] = 1
                    doc.invalid += 1
                    console.log(doc.invalid)
                    if(doc.invalid>=Math.ceil(Blockchain.no_of_validators*0.51) || doc.invalid == Blockchain.no_of_validators)
                    {
                        col.deleteOne({_id:doc._id}).then(()=>{Blockchain.penalize_voters(doc.voted_for)})
                        var trans = client.db('Blockchain').collection('pool')
                        doc.transactions.forEach((tx)=>{
                            if(!Mempool.isValid(tx))
                                trans.findOneAndUpdate({_id:tx.hash},{$set: {status:doc.status==-1}})
                            else
                                trans.findOneAndUpdate({_id:tx.hash},{$set: {status:doc.status==0}})
                        })
                    }
                }
                col.findOneAndUpdate({_id:doc._id},{$set: {voted_for:doc.voted_for,voted_against:doc.voted_against,
                            valid:doc.valid,invalid:doc.invalid,status:doc.status}},(err,doc)=>{
                        res.send({'Message':'Voted'})
                    // client.close()
            })
        
        }
        }})
    })
})

app.post('/getUsers', (req, res)=>{
    MongoClient.connect(CONNECTION_URL, (err, client)=>{
        client.db('Blockchain').collection('users').find({}).toArray((err, docs)=>{
            res.send({'Ulist':docs})
            client.close()
        })
    })
})

app.post('/addStake',(req,res)=>{
    MongoClient.connect(CONNECTION_URL,(err,client)=>{
            var col = client.db('Blockchain').collection('users')
            var stake = Number(req.body.stake)
            col.findOne({_id:req.body.public_key}, (err,doc)=>{
                if(err) throw err
            if(Blockchain.no_of_validators <= Math.ceil(Blockchain.no_of_users*Blockchain.validator_threshold)){
                    if(stake >= Blockchain.stake_threshold && stake <= Blockchain.max_threshold)
                    {
                    if(doc.balance - stake > 0)
                    {
                        doc.balance -= stake
                        doc.stake += stake 
                        doc.type = 2
                        Blockchain.no_of_validators += 1
                        //to be discussed
                        if(Blockchain.no_of_validators == 1)
                            doc.type = 3
                        col.updateOne({_id:doc.public_key},{$set: {balance:doc.balance,stake:doc.stake,type:doc.type}})
                        .then(()=>{
                            client.close()
                            res.send({'Message':'Successful','balance':doc.balance,'stake':doc.stake,'type':doc.type})
                        })
                    }
                    else{
                        client.close()
                        res.send({'Message':'Insufficient Funds','balance':doc.balance,'stake':doc.stake,'type':doc.type})
                    }
                    }
                    else{
                        client.close()
                        res.send({'Message':'Insufficient Stake','balance':doc.balance,'stake':doc.stake,'type':doc.type})
                    }
                }
                else{
                    client.close()
                    res.send({'Message':'Validator limit has reached! You cannot become a validator now','balance':doc.balance,'stake':doc.stake,'type':doc.type})
                }
        })
    })
})

app.post('/get_details',(req,res)=>{
    console.log(req.body)
    MongoClient.connect(CONNECTION_URL, (err,client)=>{
        var col = client.db('Blockchain').collection('users')
        col.findOne({_id:req.body.public_key},(err,doc)=>{
            if(!doc) res.send({'Message':'Invalid!'})
            else res.send({'Message':'Successful!', balance:doc.balance, stake:doc.stake, type:doc.type})
            client.close()
        })
    })
})

app.post('/isMiner',(req,res)=>{

    res.send({'message':'You are not a miner'})
})

app.listen(PORT)
console.log(Blockchain.index,Blockchain.prev_hash)