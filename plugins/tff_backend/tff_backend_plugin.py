# -*- coding: utf-8 -*-
# Copyright 2017 GIG Technology NV
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# @@license_version:1.3@@

from framework.plugin_loader import Plugin, get_plugin
from mcfw.properties import typed_property, unicode_property
from mcfw.rpc import parse_complex_value
from plugins.tff_backend import rogerthat_callbacks


class TOSConfiguration(object):
    order_node = unicode_property('1')


class IYOConfiguration(object):
    organization_id = unicode_property('1')
    organization_secret = unicode_property('2')


class TffConfiguration(object):
    iyo = typed_property('1', IYOConfiguration, False)
    tos = typed_property('2', TOSConfiguration, False)


class TffBackendPlugin(Plugin):

    def __init__(self, configuration):
        super(TffBackendPlugin, self).__init__(configuration)
        self.configuration = parse_complex_value(TffConfiguration, configuration, False)

        rogerthat_api_plugin = get_plugin('rogerthat_api')
        rogerthat_api_plugin.subscribe('messaging.flow_member_result', rogerthat_callbacks.flow_member_result)
        rogerthat_api_plugin.subscribe('messaging.form_update', rogerthat_callbacks.form_update)
        rogerthat_api_plugin.subscribe('friend.register_result', rogerthat_callbacks.register_result, trigger_only=True)

    def get_handlers(self, auth):
        return []
