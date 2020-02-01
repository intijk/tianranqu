<template>

<div class="armor-calculator">
<h2>护甲计算器</h2>
<p><img src="./attack-icon.jpeg" align="top" style="height: 2rem;"> 攻击力</p>
<input v-model="attack">
<p><img src="./armor-icon.jpeg" align="top" style="height: 2rem;"> 护甲</p>
<input v-model="armor">
<p><img src="./damage-coefficient-icon.png" align="top" style="height: 2rem;"> 伤害倍数</p>
{{ damage_coefficient }}
<p><img src="./damage-icon.jpeg" align="top" style="height: 2rem;"> 伤害</p>
{{ damage }}
</div>

</template>

<script>
export default {
	data: function(){
		return {
			attack: 0,
			armor: 0,
		}
	},
	computed: {
		damage: function(){
			const x=this.armor
			const y=1-(x*0.052)/(0.9+0.048*Math.abs(x))
			return this.attack * y
		},
		damage_coefficient: function(){
			const x=this.armor
			const y=1-(x*0.052)/(0.9+0.048*Math.abs(x))
			return y
		}	

	}
}


</script>
