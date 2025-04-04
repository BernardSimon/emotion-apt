import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

let Token = ""
// 定义响应数据类型
export const setToken = (token: string) => {
    Token = token
    instance.defaults.headers.common['Authorization'] = Token
}
export const getToken = () => {
    return Token
}
export interface ApiResponse<T = any> {
    status: number;
    data: T;
    errMSg: string;
    timestamp: number;
}

// 定义错误类型
export interface ApiError {
    status: number;
    errMsg: string;
    originalError?: AxiosError;
}

// 创建axios实例
const instance = axios.create({
    baseURL:  'http://localhost:8080/api',
    timeout: 1000000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器
// instance.interceptors.request.use(
//     (config) => {
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// 响应拦截器
instance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
        if (!response.data || typeof response.data.status === 'undefined') {
            throw {
                status: 500,
                errMsg: 'Invalid response structure',
            } as ApiError;
        }

        if (response.data.status !== 0) {
            throw {
                status: response.data.status,
                errMsg: response.data.errMSg || 'Business error',
            } as ApiError;
        }

        return response.data.data;
    },
    (error: AxiosError) => {
        const apiError: ApiError = {
            status: error.response?.status || 500,
            errMsg: error.message,
            originalError: error,
        };

        switch (error.response?.status) {
            case 400:
                apiError.errMsg = 'Invalid request parameters';
                break;
            case 401:
                apiError.errMsg = 'Unauthorized access';
                break;
            case 404:
                apiError.errMsg = 'Resource not found';
                break;
            case 500:
                apiError.errMsg = 'Internal server error';
                break;
        }

        return Promise.reject(apiError);
    });


// 封装GET方法
export const GET = <T = any>(
    url: string,
): Promise<T> => {
    return instance.get<never, T>(url);
};

// 封装POST方法
export const POST = <T = any, D = any>(
    url: string,
    data?: D,
): Promise<T> => {
    return instance.post<never, T, D>(url, data);
};

// 类型判断工具
export type TypeGuard<T> = (data: unknown) => data is T;
