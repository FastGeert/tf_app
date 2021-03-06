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

import logging


class HosterSteps(object):
    DOWNLOAD = 'DOWNLOAD'
    REGISTER_IYO = 'REGISTER_IYO'
    FLOW_INIT = 'FLOW_INIT'
    FLOW_ADDRESS = 'FLOW_ADDRESS'
    FLOW_SIGN = 'FLOW_SIGN'
    NODE_SENT = 'NODE_SENT'
    NODE_POWERED = 'NODE_POWERED'

    DESCRIPTIONS = {
        DOWNLOAD: 'Download the ThreeFold app',
        REGISTER_IYO: 'Register on ItsYou.Online',
        FLOW_INIT: 'Initiate “become a hoster process” in the TF app',
        FLOW_SIGN: 'Sign the hoster agreement',
        FLOW_ADDRESS: 'Share shipping address, telephone number, name with shipping company',
        NODE_SENT: 'Receive confirmation of sending',
        NODE_POWERED: 'Hook up node to Internet and power',
    }

    @classmethod
    def all(cls):
        return [cls.DOWNLOAD,
                cls.REGISTER_IYO,
                cls.FLOW_INIT,
                cls.FLOW_ADDRESS,
                cls.FLOW_SIGN,
                cls.NODE_SENT,
                cls.NODE_POWERED]

    @classmethod
    def should_archive(cls, step):
        return cls.NODE_POWERED == step

    @classmethod
    def get_name_for_step(cls, step):
        if step not in cls.DESCRIPTIONS:
            logging.error('Hoster description for step \'%s\' not set', step)
        return cls.DESCRIPTIONS.get(step, step)

    @classmethod
    def get_progress(cls, last_checked_step):
        checked = False
        items = []
        for step in reversed(cls.all()):
            if not checked and step == last_checked_step:
                checked = True

            item = {
                'id': step,
                'name': cls.get_name_for_step(step),
                'checked': checked
            }
            items.append(item)

        return {
            'id': 'hoster',
            'name': 'Become a hoster',
            'items': list(reversed(items))
        }
