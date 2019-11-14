// call源码实现
// https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Function/call
/*
* 1.没有指定this，this只想window
* 2.传入参数
* 3.方法名具有唯一性*/
Function.prototype.mycall = function(context) {
    // 如果没有传或传的值为空对象 context指向window
    context = context || window
    let fn = Symbol(context)
    context[fn] = this //给context添加一个方法 指向this
    // 处理参数 去除第一个参数this 其它传入fn函数
    let arg = [...arguments].slice(1)
    context[fn](...arg) //执行fn
    delete context[fn] //删除方法
}

//生成唯一的值
export function Symbol(obj) {
    let unique = (Math.random() + new Date().getTime()).toString(32).slice(0, 8)
    if (obj.hasOwnProperty(unique)) {
        return mySymbol(obj) //递归调用
    } else {
        return unique
    }
}


