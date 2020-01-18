// 手动实现promise

// 1.设定promise的三种状态常量
const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

// 2.判断传入参数是否为函数
const isFunction = variable => typeof variable === 'function'

class Promise {
    constructor (handle) {
        if (!isFunction(handle)) {
            throw new Error('接收的参数为函数')
        }

        // 添加状态
        this._status = PENDING
        this._value = undefined

        // 增加执行队列
        this._fulfilledQueues = []
        this._rejectedQueues = []

        // 执行handle
        try {
            handle(this._resolve.bind(this), this._reject.bind(this))
        } catch (err) {
            this._reject(err)
        }

        // resolve时执行的函数
        _resolve (val){
            if (this._status !== PENDING) return
            this._status = FULFILLED
            this._value = val
        }

        // reject时执行的函数
        _reject (err){
            if (this._status !== PENDING) return
            this._status = REJECTED
            this._value = err
        }


        // 添加then方法
        // 添加then方法
        then (onFulfilled, onRejected) {
            const { _value, _status } = this
            switch (_status) {
                // 当状态为pending时，将then方法回调函数加入执行队列等待执行
                case PENDING:
                    this._fulfilledQueues.push(onFulfilled)
                    this._rejectedQueues.push(onRejected)
                    break
                // 当状态已经改变时，立即执行对应的回调函数
                case FULFILLED:
                    onFulfilled(_value)
                    break
                case REJECTED:
                    onRejected(_value)
                    break
            }
            // 返回一个新的Promise对象
            return new MyPromise((onFulfilledNext, onRejectedNext) => {
            })
        }
    }
}
