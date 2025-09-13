export const components = [
  { id:'api', name:'API Gateway', defaultParams:{}, category:'edge' },
  { id:'web', name:'Web App', defaultParams:{replicas:2}, category:'app' },
  { id:'cache', name:'Cache', defaultParams:{size:'small'}, category:'storage' },
  { id:'db', name:'DB (Primary)', defaultParams:{replicas:1}, category:'storage' },
  { id:'object', name:'Object Store', defaultParams:{region:'single'}, category:'storage' },
  { id:'queue', name:'Queue', defaultParams:{ttl:3600}, category:'integration' }
]
