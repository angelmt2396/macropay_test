const express = require('express');
const app = express();
const fakeDB = require('./fakedatabase.js')

const schemaContact = {
    id: "",
    name: "",
    phone: "",
    addressLines:[]

}

app.get("/contacts", (req, res) => {
    let phraseReq = req.query.phrase;
    let idReq = req.query.id;
    if(phraseReq == undefined && idReq == undefined){
        orderbyName(fakeDB)
        res.status(200).send(fakeDB)
    }else{
        if(phraseReq != undefined && idReq == undefined){
            if(phraseReq.trim() != ""){
                res.status(200).send(filterName(fakeDB,phraseReq))
            }else{
                res.status(400).json([])
            }
        }

        if(idReq != undefined && phraseReq == undefined){
            var contact = filterId(fakeDB,idReq);
            if(contact != null){
                res.status(200).send(contact)
            }else{
                res.sendStatus(404)
            }
            
        }

        if(phraseReq != undefined && idReq != undefined){
            res.sendStatus(405)
        }
    }
});

app.delete("/contacts", (req, res) => {
    let idReq = req.headers.id;
    if(idReq != undefined){
        var posDelete = deleteId(fakeDB,idReq);
        if(posDelete == -1){
            res.sendStatus(404)
        }else{
            res.sendStatus(204)
        }
    }else{
        res.sendStatus(405)
    }
});


app.use((req, res, next) => {
    console.log("[IP] " + req.ip);
    next();
  });
   
app.post("/contacts", (req, res) => {
    let headers = req.headers;
    if(headers["id"] != undefined && headers["name"] != undefined && headers["phone"] != undefined && headers["address"] != undefined){
        schemaContact.id = headers["id"];
        schemaContact.name = headers["name"]
        schemaContact.phone = headers["phone"]
        schemaContact.addressLines = headers["address"]
        
        if(filterId(fakeDB,headers["id"]) != null){
            res.sendStatus(405)
        }else{
            fakeDB.push(schemaContact)
            var contact = filterId(fakeDB,headers["id"]);
            res.status(200).send(contact)//se regresa el contacto creado
        }

    }else{
        res.sendStatus(405)
    }
});

app.all("/*", (req, res) => {
    res.sendStatus(404);
});
app.listen(3030, () => {
    console.log("server on port 3030")
});

//devuelve los contactos ordenados por nombres
const orderbyName = (array) => {
    array.sort((val1, val2) => {
        if(val1.name <val2.name){
            return -1;
        }else if(val1.name > val2.name){
            return 1;
        }else{
            return 0;
        }
    });
}

//devuelve los contactos filtrados segun una frase en la url
const filterName = (array, param) => {
    var arrayNameFilter = []
    array.forEach(element => {
        let index = element.name.toLowerCase().indexOf(param.toLowerCase());

        if(index >= 0){
            arrayNameFilter.push(element);
        }
    });

    return arrayNameFilter;
}

//devuelve un contacto segun su id
const filterId = (array, id) => {
    let object = null;
    array.forEach(element => {
        if(element.id == id){
            object = element
        }
    });
    return object;
}

//elimina un contacto segun su id
const deleteId = (array, id) => {
    var index = -1;
    array.forEach((element, i) => {
        if(element.id == id){
            index = i
        }
    });
    if(index != -1){
        array.splice(index,1)
    }
    return index
}