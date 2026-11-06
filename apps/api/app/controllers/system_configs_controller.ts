import SystemConfigService from '#services/system_config_service'
import {
  createSystemConfigValidator,
  listSystemConfigsValidator,
  updateSystemConfigValidator,
} from '#validators/system_config'
import type { HttpContext } from '@adonisjs/core/http'

export default class SystemConfigsController {
  async index({ request, response }: HttpContext) {
    response.header('Cache-Control', 'no-store')
    return SystemConfigService.list(await request.validateUsing(listSystemConfigsValidator))
  }

  async store({ request, response }: HttpContext) {
    response.header('Cache-Control', 'no-store')
    return response.created(
      await SystemConfigService.create(await request.validateUsing(createSystemConfigValidator))
    )
  }

  async update({ params, request, response }: HttpContext) {
    response.header('Cache-Control', 'no-store')
    return SystemConfigService.update(
      params.id,
      await request.validateUsing(updateSystemConfigValidator)
    )
  }

  async destroy({ params, response }: HttpContext) {
    await SystemConfigService.delete(params.id)
    return response.noContent()
  }

  async publicIndex({ response }: HttpContext) {
    response.header('Cache-Control', 'no-store')
    return SystemConfigService.publicValues()
  }
}
