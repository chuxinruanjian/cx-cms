import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const getApiProxyTarget = () => {
  if (process.env.API_PROXY_TARGET) {
    return process.env.API_PROXY_TARGET;
  }

  try {
    const apiEnv = readFileSync(join(__dirname, '../../api/.env'), 'utf8');
    const port = apiEnv.match(/^\s*PORT\s*=\s*["']?(\d+)["']?\s*$/m)?.[1];
    if (port) {
      return `http://127.0.0.1:${port}`;
    }
  } catch {
    // The API .env may not exist before the installation steps are completed.
  }

  return 'http://127.0.0.1:3333';
};

const apiProxyTarget = getApiProxyTarget();

/**
 * @name 代理的配置
 * @see 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 *
 * @doc https://umijs.org/docs/guides/proxy
 */
export default {
  // Local admin requests are forwarded to the AdonisJS API.
  dev: {
    '/api/': {
      target: apiProxyTarget,
      changeOrigin: true,
    },
  },
  /**
   * @name 详细的代理配置
   * @doc https://github.com/chimurai/http-proxy-middleware
   */
  test: {
    // localhost:8000/api/** -> https://pro-api.ant-design-demo.workers.dev/api/**
    '/api/': {
      target: 'https://pro-api.ant-design-demo.workers.dev',
      changeOrigin: true,
    },
  },
  pre: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
    },
  },
};
