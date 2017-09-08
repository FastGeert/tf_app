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

from __future__ import unicode_literals

import re

from framework.plugin_loader import get_config
from plugins.its_you_online_auth.plugin_consts import NAMESPACE as IYO_NAMESPACE

config = get_config(IYO_NAMESPACE)
ROOT_ORGANIZATION = config.root_organization.name
USERS_REGEX = re.compile('^user:memberof:%s.users.(default|hosters|investors|ambassadors)$' % ROOT_ORGANIZATION)


class Roles(object):
    ADMINS = 'admins'
    PAYMENT_ADMIN = 'payment-admin'
    DEFAULT = 'default'
    HOSTER = 'hosters'
    INVITED = 'invited'
    INVESTOR = 'investors'
    AMBASSADORS = 'ambassadors'


class PluginRoles(object):
    ADMINS = 'tff-admins'
    PAYMENT_ADMIN = 'tff-payment-admin'
    DEFAULT = 'tff-default'
    HOSTER = 'tff-hosters'
    INVITED = 'tff-invited'
    INVESTOR = 'tff-investors'
    AMBASSADORS = 'tff-ambassadors'


class PermissionType(object):
    USERS = 'users'


class Organization(object):
    ADMIN = '%s.admins' % ROOT_ORGANIZATION
    PAYMENT_ADMIN = '%s.payment-admins' % ROOT_ORGANIZATION
    DEFAULT_USER = '%s.users.%s' % (ROOT_ORGANIZATION, Roles.DEFAULT)
    HOSTER = '%s.users.%s' % (ROOT_ORGANIZATION, Roles.HOSTER)
    INVITED = '%s.users.%s' % (ROOT_ORGANIZATION, Roles.INVITED)
    INVESTOR = '%s.users.%s' % (ROOT_ORGANIZATION, Roles.INVESTOR)
    AMBASSADOR = '%s.users.%s' % (ROOT_ORGANIZATION, Roles.AMBASSADORS)

    ROLES = {
        Roles.ADMINS: ADMIN,
        Roles.PAYMENT_ADMIN: PAYMENT_ADMIN,
        Roles.DEFAULT: DEFAULT_USER,
        Roles.HOSTER: HOSTER,
        Roles.INVITED: INVITED,
        Roles.INVESTOR: INVESTOR,
        Roles.AMBASSADORS: AMBASSADOR,
    }

    @staticmethod
    def get_by_role_name(role_name):
        return Organization.ROLES.get(role_name, None)


class Scope(object):
    _memberof = 'user:memberof:%s'
    ROOT_ADMIN = _memberof % ROOT_ORGANIZATION
    ADMIN = _memberof % Organization.ADMIN
    PAYMENT_ADMIN = _memberof % Organization.PAYMENT_ADMIN
    DEFAULT_USER = _memberof % Organization.DEFAULT_USER
    HOSTER = _memberof % Organization.HOSTER
    INVITED = _memberof % Organization.INVITED
    INVESTOR = _memberof % Organization.INVESTOR
    AMBASSADOR = _memberof % Organization.AMBASSADOR


class Scopes(object):
    ADMIN = [Scope.ADMIN, Scope.ROOT_ADMIN]
    PAYMENT_ADMIN = [Scope.ROOT_ADMIN, Scope.PAYMENT_ADMIN]
    DEFAULT_USER = ADMIN + [Scope.DEFAULT_USER]
    HOSTER = DEFAULT_USER + [Scope.HOSTER]
    INVITED = DEFAULT_USER + [Scope.INVITED]
    INVESTOR = DEFAULT_USER + [Scope.INVESTOR]
    AMBASSADOR = DEFAULT_USER + [Scope.AMBASSADOR]


SCOPE_ROLES = {
    PermissionType.USERS: [Roles.DEFAULT, Roles.HOSTER, Roles.INVITED, Roles.INVESTOR, Roles.AMBASSADORS]
}


class UserPermissions(object):
    users = []  # type: list of unicode
    admin = False
    payment_admin = False

    def __init__(self, admin, payment_admin, users):
        """
        Args:
            admin (boolean)
            payment_admin (boolean)
            users (list of unicode)
        """
        self.admin = admin
        self.payment_admin = payment_admin
        self.users = users


def get_permissions_from_scopes(scopes):
    admin = False
    payment_admin = False
    users = []
    for scope in scopes:
        if scope == Scope.ADMIN or scope == Scope.ROOT_ADMIN:
            admin = True
            continue
        if scope == Scope.PAYMENT_ADMIN:
            payment_admin = True
        users_re = USERS_REGEX.match(scope)
        # e.g. {root_org}.users.hosters
        if users_re:
            groups = users_re.groups()
            users.append(groups[0])
            continue
    return UserPermissions(admin, payment_admin, users)


def get_permission_strings(scopes):
    perms = []
    permissions = get_permissions_from_scopes(scopes)
    if permissions.admin:
        perms.append(PluginRoles.ADMINS)
    if permissions.payment_admin:
        perms.append(PluginRoles.PAYMENT_ADMIN)
    for perm in permissions.users:
        perms.append('tff-%s' % perm)
    return perms
