const {test}=require('node:test');const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');const context={window:{}};vm.runInNewContext(fs.readFileSync('property-price.js','utf8'),context);const total=context.window.AntaraTotalPrice;
test('rate times area with matching units',()=>assert.equal(total('2500','1200','sq.ft','sq.ft'),3000000));
test('acre area converted to rate per square foot',()=>assert.equal(total('100','1','sq.ft','acre'),4356000));
test('numbers work when neither unit is specified',()=>assert.equal(total('1250','1000','',''),1250000));
test('missing or incompatible units and incomplete input do not generate a total',()=>{for(const args of [['','1200','',''],['2500','','',''],['2500','1200','month','sq.ft'],['2500','1200','sq.ft',''],['-1','100','','']])assert.equal(total(...args),null);});
test('decimal totals rounded to currency precision',()=>assert.equal(total('12.345','10','sq.m','sq.m'),123.45));
