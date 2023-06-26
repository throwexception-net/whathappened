import fetchxhrInterceptor from "./fetchxhrInterceptor";

console.log('interceptors')

const interceptor = fetchxhrInterceptor({
  emit(name: string, payload) {
    console.log('fetchxhrInterceptor', name, payload)
  }
})
