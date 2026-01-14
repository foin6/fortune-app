#!/usr/bin/env python3
"""
人生 K 线接口联调测试脚本
用于测试前后端数据传递是否正常
"""
import requests
import json
import sys

API_URL = 'http://localhost:8000/api/divination/life-line'

def test_life_line_api():
    """测试人生 K 线接口"""
    print('=' * 60)
    print('人生 K 线接口联调测试')
    print('=' * 60)
    print()
    
    # 测试数据（模拟前端发送的数据）
    test_data = {
        'year': 2000,
        'month': 1,
        'day': 1,
        'hour': 12,
        'minute': 0,
        'lng': 116.3974,
        'lat': 39.9093,
        'gender': 'male',
        'name': '测试用户'
    }
    
    print('📤 发送请求:')
    print(f'  URL: {API_URL}')
    print(f'  方法: POST')
    print(f'  数据: {json.dumps(test_data, ensure_ascii=False, indent=2)}')
    print()
    
    try:
        # 发送请求
        response = requests.post(API_URL, json=test_data, timeout=60)
        
        print(f'📥 响应状态码: {response.status_code}')
        print()
        
        if response.status_code == 200:
            result = response.json()
            
            # 检查返回格式
            print('✅ 接口调用成功')
            print()
            print('📋 返回格式检查:')
            print(f'  - success: {result.get("success")}')
            print(f'  - data 存在: {"data" in result}')
            print()
            
            if result.get('data'):
                data = result['data']
                
                print('📊 数据内容:')
                print(f'  - user_profile: {type(data.get("user_profile"))}')
                if data.get('user_profile'):
                    print(f'    * name: {data["user_profile"].get("name")}')
                    print(f'    * bazi: {data["user_profile"].get("bazi")}')
                
                print(f'  - chart_data 长度: {len(data.get("chart_data", []))}')
                if data.get('chart_data'):
                    print('    * 前3个数据点:')
                    for i, point in enumerate(data['chart_data'][:3]):
                        print(f'      [{i}] age={point.get("age")}, year={point.get("year")}, score={point.get("score")}, gan_zhi={point.get("gan_zhi")}')
                    print('    * 最后3个数据点:')
                    for i, point in enumerate(data['chart_data'][-3:], len(data['chart_data'])-3):
                        print(f'      [{i}] age={point.get("age")}, year={point.get("year")}, score={point.get("score")}, gan_zhi={point.get("gan_zhi")}')
                
                print(f'  - summary: {type(data.get("summary"))}')
                if data.get('summary'):
                    summary = data['summary']
                    print(f'    * current_score: {summary.get("current_score")}')
                    print(f'    * trend: {summary.get("trend")}')
                    print(f'    * peaks 数量: {len(summary.get("peaks", []))}')
                    print(f'    * valleys 数量: {len(summary.get("valleys", []))}')
                    print(f'    * advice: {summary.get("advice", "")[:50]}...')
                
                print()
                print('✅ 数据格式符合前端期望')
                print()
                print('=' * 60)
                print('✅ 联调测试通过')
                print('=' * 60)
                return True
            else:
                print('❌ 返回数据中没有 data 字段')
                return False
        else:
            print(f'❌ 接口调用失败')
            print(f'响应内容: {response.text}')
            return False
            
    except requests.exceptions.ConnectionError:
        print('❌ 无法连接到服务器')
        print('   请确保后端服务正在运行: python main.py')
        return False
    except Exception as e:
        print(f'❌ 错误: {e}')
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = test_life_line_api()
    sys.exit(0 if success else 1)
