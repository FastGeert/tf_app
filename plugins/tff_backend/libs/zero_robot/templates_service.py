# DO NOT EDIT THIS FILE. This file will be overwritten when re-running go-raml.


class TemplatesService:
    def __init__(self, client):
        self.client = client

    def ListTemplates(self, headers=None, query_params=None, content_type="application/json"):
        """
        List all the templates available to the ZeroRobot
        It is method for GET /templates
        """
        if query_params is None:
            query_params = {}

        uri = self.client.base_url + "/templates"
        return self.client.get(uri, None, headers, query_params, content_type)

    def AddTemplateRepo(self, data, headers=None, query_params=None, content_type="application/json"):
        """
        Clone a template repository and make the templates available to the ZeroRobot
        It is method for POST /templates
        """
        if query_params is None:
            query_params = {}

        uri = self.client.base_url + "/templates"
        return self.client.post(uri, data, headers, query_params, content_type)
