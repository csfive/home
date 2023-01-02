---
layout: page
---

<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers
} from 'vitepress/theme'

const members = [
  {
    avatar: 'https://www.github.com/mancuoj.png',
    name: 'mancuoj',
    links: [
      { icon: 'github', link: 'https://github.com/mancuoj' },
    ]
  },
  {
    avatar: 'https://www.github.com/stupidman111.png',
    name: 'stupidman111',
    links: [
      { icon: 'github', link: 'https://github.com/stupidman111' },
    ]
  },
  {
    avatar: 'https://www.github.com/haojianuo.png',
    name: 'haojianuo',
    links: [
      { icon: 'github', link: 'https://github.com/haojianuo' },
    ]
  },
]
</script>

<VPTeamPage>
  
  <VPTeamPageTitle>
    <template #title>
      团队成员
    </template>
    <template #lead>
    </template>
  </VPTeamPageTitle> 
 
  <VPTeamMembers
    :members="members"
  />
</VPTeamPage>