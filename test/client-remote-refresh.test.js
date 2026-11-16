/**
 * 插件在 apply 里订阅的账号类 remote 事件（dsh-api-remotes 的 emit 转发事件）。
 *
 * 登录账号切换 / 登出（credentials/record-updated 携带的是授权记录 key）或登录会话
 * 失效时，余额气泡应立刻重拉，而不是等 60s 轮询。令牌徽标不走这里——设置页自己
 * 订阅 credentials/reference-updated，所以只需验证这三条与解绑。
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createHarness } from './helpers/client-harness.mjs'

const ACCOUNT_EVENTS = [
  'credentials/record-updated',
  'deepseek-account/session-expired',
  'deepseek-account/model-sign-in-required',
]

test('apply subscribes the account refresh events and unbinds them on dispose', () => {
  const harness = createHarness()
  const names = harness.remoteSubs.map((sub) => sub.name)
  for (const name of ACCOUNT_EVENTS) {
    assert.ok(names.includes(name), `应为 ${name} 注册订阅`)
  }
  // 广播时回调不得抛错（余额控件可能尚未挂载）。
  for (const name of ACCOUNT_EVENTS) harness.emitRemote(name)
  assert.equal(harness.remoteSubs.length, ACCOUNT_EVENTS.length, '不应重复订阅')
  harness.dispose()
  assert.deepEqual(harness.remoteSubs, [], '停用插件必须解绑全部订阅')
})
