// This file is intentionally inert unless deployRuntime is explicitly true.
// Validate with: az deployment group what-if --resource-group <rg> --template-file main.bicep --parameters deployRuntime=false
targetScope = 'resourceGroup'

@description('Azure region for a later approved deployment.')
param location string = resourceGroup().location

@description('Exact approved container image to deploy later.')
param containerImage string = ''

@description('Hard safety gate. The default produces no runtime resources.')
param deployRuntime bool = false

@description('Container App name for the backend API.')
param appName string = 'autoapply-sa-api'

@description('Container Apps managed environment resource ID, created separately only after approval.')
param managedEnvironmentId string = ''

resource api 'Microsoft.App/containerApps@2024-03-01' = if (deployRuntime) {
  name: appName
  location: location
  properties: {
    managedEnvironmentId: managedEnvironmentId
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'auto'
      }
    }
    template: {
      containers: [
        {
          name: 'api'
          image: containerImage
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 2
      }
    }
  }
}

output apiFqdn string = deployRuntime ? api.properties.configuration.ingress.fqdn : 'No Azure runtime requested.'
