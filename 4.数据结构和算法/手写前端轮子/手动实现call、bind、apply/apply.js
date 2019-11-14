// 相比于call方法，apply只有多参数时第二个参数是数组

import {Symbol} from './call'

Function.prototype.myApply = function(context) {
    // 如果没有传或传的值为空对象 context指向window
    if (typeof context === "undefined" || context === null) {
        context = window
    }
    let fn = Symbol(context)
    context[fn] = this //给context添加一个方法 指向this
    // 处理参数 去除第一个参数this 其它传入fn函数
    let arg = [...arguments].slice(1)
    context[fn](arg) //执行fn
    delete context[fn] //删除方法
}

