import { shallowMount } from '@vue/test-utils'
import Search from '@/components/Search.vue'

describe('Auto.vue', () => {
  it('renders props.msg when passed', () => {
    const msg = 'Alles Autos'
    const wrapper = shallowMount(Search, {
      props: { msg }
    })
    expect(wrapper.text()).toMatch(msg)
  })
})
