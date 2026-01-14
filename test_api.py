#!/usr/bin/env python3
"""
测试后端 API 接口
"""
import requests
import json
from datetime import datetime

API_BASE_URL = "http://localhost:8000"

def test_root():
    """测试根路径"""
    print("=" * 60)
    print("测试 1: GET / (根路径)")
    print("=" * 60)
    try:
        response = requests.get(f"{API_BASE_URL}/")
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 根路径访问成功")
            print(f"   消息: {data.get('message')}")
            print(f"   版本: {data.get('version')}")
            return True
        else:
            print(f"❌ 根路径访问失败: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ 连接失败: {e}")
        return False

def test_save_fortune_book():
    """测试保存命书接口"""
    print("\n" + "=" * 60)
    print("测试 2: POST /api/fortune-books (保存命书)")
    print("=" * 60)
    
    # 准备测试数据
    test_data = {
        "name": f"测试命书-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "person_name": "测试用户",
        "gender": "male",
        "birth_date": "2000-01-01",
        "birth_time": "12:00",
        "lat": 39.9042,
        "lng": 116.4074,
        "city": "北京",
        "analysis_result": {  # 直接发送对象，不要 JSON.stringify
            "day_master": {"gan": "戊", "zhi": "午", "wuxing": "土"},
            "five_elements": {"scores": {"木": 10, "火": 27, "土": 23}},
            "gods": {"useful_god": "水"},
            "generated_at": datetime.now().isoformat()
        },
        "summary": json.dumps({
            "bazi_report": {
                "chart": {"day_gan": "戊", "day_zhi": "午"},
                "five_elements": {"scores": {"木": 10, "火": 27, "土": 23}},
                "gods": {"useful_god": "水"},
                "da_yun": []
            },
            "llm_data": {
                "personality_tags": ["测试标签"],
                "essence_text": "测试命理精华",
                "analysis_text": "测试分析文本"
            },
            "generated_at": datetime.now().isoformat()
        }, ensure_ascii=False)
    }
    
    try:
        print(f"发送数据: name={test_data['name']}")
        response = requests.post(
            f"{API_BASE_URL}/api/fortune-books",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 保存成功")
            print(f"   返回的 id: {data.get('id')}")
            print(f"   返回的 status: {data.get('status')}")
            print(f"   返回的 new_id: {data.get('new_id')}")
            
            # 返回保存的 ID 用于后续测试
            return data.get('id') or data.get('new_id')
        else:
            print(f"❌ 保存失败: {response.status_code}")
            print(f"   错误信息: {response.text[:200]}")
            return None
    except Exception as e:
        print(f"❌ 请求失败: {e}")
        return None

def test_get_fortune_book(book_id):
    """测试获取命书详情接口"""
    print("\n" + "=" * 60)
    print(f"测试 3: GET /api/fortune-books/{book_id} (获取详情)")
    print("=" * 60)
    
    if not book_id:
        print("⚠️  跳过测试：没有有效的 book_id")
        return False
    
    try:
        response = requests.get(f"{API_BASE_URL}/api/fortune-books/{book_id}")
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 获取成功")
            if data.get('success'):
                book_data = data.get('data', {})
                print(f"   命书名: {book_data.get('name')}")
                print(f"   姓名: {book_data.get('person_name')}")
                print(f"   有 summary: {'是' if book_data.get('summary') else '否'}")
                print(f"   有 analysis_result: {'是' if book_data.get('analysis_result') else '否'}")
                return True
            else:
                print(f"❌ 返回 success=False")
                return False
        elif response.status_code == 404:
            print(f"❌ 命书不存在 (404)")
            return False
        elif response.status_code == 403:
            print(f"❌ 权限拒绝 (403)")
            return False
        else:
            print(f"❌ 获取失败: {response.status_code}")
            print(f"   错误信息: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ 请求失败: {e}")
        return False

def test_get_fortune_books_list():
    """测试获取命书列表接口"""
    print("\n" + "=" * 60)
    print("测试 4: GET /api/user/fortune-books (获取命书列表)")
    print("=" * 60)
    
    try:
        response = requests.get(f"{API_BASE_URL}/api/user/fortune-books")
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 获取成功")
            if data.get('success'):
                books = data.get('data', [])
                print(f"   命书数量: {len(books)}")
                if books:
                    print(f"   最新命书: {books[0].get('name')}")
                return True
            else:
                print(f"❌ 返回 success=False")
                return False
        else:
            print(f"❌ 获取失败: {response.status_code}")
            print(f"   错误信息: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"❌ 请求失败: {e}")
        return False

def main():
    """运行所有测试"""
    print("\n" + "=" * 60)
    print("开始测试后端 API 接口")
    print("=" * 60)
    print(f"API 地址: {API_BASE_URL}")
    print()
    
    results = []
    
    # 测试 1: 根路径
    results.append(("根路径", test_root()))
    
    # 测试 2: 保存命书
    saved_id = test_save_fortune_book()
    results.append(("保存命书", saved_id is not None))
    
    # 测试 3: 获取命书详情
    if saved_id:
        results.append(("获取详情", test_get_fortune_book(saved_id)))
    else:
        results.append(("获取详情", False))
    
    # 测试 4: 获取命书列表
    results.append(("获取列表", test_get_fortune_books_list()))
    
    # 总结
    print("\n" + "=" * 60)
    print("测试总结")
    print("=" * 60)
    for name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{name}: {status}")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    print(f"\n总计: {passed}/{total} 通过")
    
    if passed == total:
        print("\n🎉 所有测试通过！后端接口工作正常。")
    else:
        print(f"\n⚠️  有 {total - passed} 个测试失败，请检查后端服务。")

if __name__ == "__main__":
    main()
