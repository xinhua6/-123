/*
* 1.改变this
* 2.接收多个参数
* 3.支持柯里话形式传参
* 4.返回一个绑定this的函数*/

Function.prototype.bind = function(context) {
    //返回一个绑定this的函数，我们需要在此保存this
    let self = this
    // 可以支持柯里化传参，保存参数
    let arg = [...arguments].slice(1)
    // 返回一个函数
    return function() {
        //同样因为支持柯里化形式传参我们需要再次获取存储参数
        let newArg = [...arguments]
        // 返回函数绑定this，传入两次保存的参数
        //考虑返回函数有返回值做了return
        return self.apply(context, arg.concat(newArg))
    }
}
