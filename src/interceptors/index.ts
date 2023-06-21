import ajaxInterceptor from './ajaxInterceptor'

console.log('install ajaxInterceptor')

// @ts-ignore
ajaxInterceptor({
  emit(name: string, payload: any) {
    console.log('ajaxInterceptor', name, payload)
  }
}, 0)


