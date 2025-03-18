with
	evm_hex_decode ('0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8') as usdc_weth_03_pool_address,
	18 as weth_decimals,
	6 as usdc_decimals,
	prices as (
		select
			timestamp,
			1 / (
				pow (1.0001, JSONExtract (inputs, 'arg6', 'Int32')) / pow (10, weth_decimals - usdc_decimals)
			) as price
		from
			agnostic__blockchain__ethereum_mainnet__decoded_logs
		where
			date >= '2025-01-01'
			and address = usdc_weth_03_pool_address
			and signature = 'Swap(address,address,int256,int256,uint160,uint128,int24)'
	)
select
	date_trunc('day', timestamp) as "datetime",
	argMin (price, timestamp) as "open",
	argMax (price, timestamp) as "close",
	min(price) as "low",
	max(price) as "high"
from
	prices
group by
	"datetime"
order by
	"datetime" asc
