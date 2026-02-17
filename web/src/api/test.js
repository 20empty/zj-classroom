import request from './request';

export function getHello() {
    return request({
        url: '/hello',
        method: 'get'
    });
}

export function qwenVl(data) {
    return request({
        url: '/qwen-vl',
        method: 'post',
        data
    });
}
