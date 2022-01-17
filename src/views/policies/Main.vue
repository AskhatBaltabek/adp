<template>
  <div>
    <a-row type="flex" :gutter="[16,16]">
      <a-col :xs="{ span: 12 }" :sm="{ span: 12 }" :md="{ span: 8 }" :lg="{ span: 8 }" :xl="{ span: 8 }" :xxl="{ span: 6 }" v-for="(product, index) in products" :key="index">
        <a :href="product.url">
          <card :item="product" size="small"></card>
        </a>
      </a-col>
    </a-row>
    <a-divider />
    <a-row type="flex" :gutter="24">
      <a-col align="center" :span="8" v-for="(item, index) in circles" :key="index">
        <a-progress
          type="dashboard"
          :stroke-width="10"
          :stroke-color="{
          '0%': '#108ee9',
          '100%': '#87d068',
        }"
          :percent="item.percent"
        />
        <h2>{{ item.title }}</h2>
      </a-col>
    </a-row>
    <a-divider />
    <a-row type="flex" :gutter="[32]">
      <a-col :span="8" align="center">
        <a-card size="small" loading title="Info 1">
          <a slot="extra" href="#">more</a>
          <p>card content</p>
          <p>card content</p>
          <p>card content</p>
        </a-card>
      </a-col>
      <a-col :span="8" align="center">
        <a-card size="small" loading title="Info 2">
          <a slot="extra" href="#">more</a>
          <p>card content</p>
          <p>card content</p>
          <p>card content</p>
        </a-card>
      </a-col>
      <a-col :span="8" align="center">
        <a-card size="small" loading title="Info 3">
          <a slot="extra" href="#">more</a>
          <p>card content</p>
          <p>card content</p>
          <p>card content</p>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import Card from "@/components/global/Card";

export default {
  components: {Card},
  data() {
    return {
      circles: [
        {
          title: 'Каско',
          percent: 94,
        },
        {
          title: 'Шанырак',
          percent: 29,
        },
        {
          title: 'ОСТ',
          percent: 13,
        },
      ],
      products: [
        {
          title: 'КАСКО',
          icon: 'crown',
          url: '/kasko',
          links: [
            {
              title: 'Новый полис',
              url: '/kasko/new'
            },
            {
              title: 'Список полисов',
              url: '/kasko'
            }
          ]
        },
        {
          title: 'МСТ',
          icon: 'usergroup-add',
          url: '/mst',
          links: [
            {
              title: 'Новый полис',
              url: '/mst/new'
            },
            {
              title: 'Список полисов',
              url: '/mst'
            }
          ]
        },
        {
          title: 'МСТ Автошоп',
          icon: 'usergroup-add',
          url: '/autoshop',
          links: [
            {
              title: 'Новый полис',
              url: '/autoshop/new'
            },
            {
              title: 'Список полисов',
              url: '/autoshop'
            }
          ]
        },
      ],
    }
  },
}
</script>
