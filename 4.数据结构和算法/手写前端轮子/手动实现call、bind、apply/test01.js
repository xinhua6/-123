let obj = {
    name: 'test'
}

function testName(first,last) {
    console.log(this)
    console.log(`${first}+ ${this.name}+ ${last}`)
}

// 使用call
testName('my','web') // my+ undefined+ web
testName.call(obj,'my','web') // my+ test+ web


// 使用apply
testName.apply(obj,['my','web']) // my+ test+ web


// 使用bind
// testName.bind(obj)  // 不执行
let fn = testName.bind(obj) // my+ test+ web
fn('my','web')


