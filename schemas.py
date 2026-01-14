"""
人生 K 线数据模型
定义与前端 Recharts 兼容的数据结构
"""
from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class PeakValley(BaseModel):
    """高峰或低谷节点"""
    age: int = Field(..., description="年龄")
    year: int = Field(..., description="年份")
    reason: str = Field(..., description="原因说明")
    score: Optional[int] = Field(None, description="该年份的分数")


class ChartDataPoint(BaseModel):
    """图表数据点（0-100岁，每年一个数据点）"""
    age: int = Field(..., description="年龄（0-100）")
    year: int = Field(..., description="年份")
    score: int = Field(..., ge=0, le=100, description="运势分数（0-100）")
    is_peak: bool = Field(False, description="是否为高峰")
    is_valley: bool = Field(False, description="是否为低谷")
    gan_zhi: str = Field(..., description="流年干支")
    da_yun: Optional[str] = Field(None, description="大运干支")
    details: str = Field("", description="详细说明")
    label: Optional[str] = Field(None, description="标签（如'吉'、'凶'）")


class LifeCurveResponse(BaseModel):
    """人生 K 线响应数据"""
    user_profile: Dict = Field(..., description="用户信息（name, bazi list）")
    chart_data: List[ChartDataPoint] = Field(..., description="0-100岁的数据列表（101个数据点）")
    summary: Dict = Field(..., description="总结信息（current_score, trend, peaks, valleys, advice）")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_profile": {
                    "name": "张三",
                    "bazi": ["庚午", "辛巳", "庚辰", "癸未"]
                },
                "chart_data": [
                    {
                        "age": 0,
                        "year": 2000,
                        "score": 60,
                        "is_peak": False,
                        "is_valley": False,
                        "gan_zhi": "庚辰",
                        "da_yun": "壬午",
                        "details": "平稳发展",
                        "label": "平"
                    }
                ],
                "summary": {
                    "current_score": 65,
                    "trend": "上升",
                    "peaks": [
                        {"age": 26, "year": 2026, "reason": "官印相生", "score": 85}
                    ],
                    "valleys": [
                        {"age": 30, "year": 2030, "reason": "岁运并临", "score": 45}
                    ],
                    "advice": "建议在高峰年份把握机会，低谷年份谨慎行事"
                }
            }
        }
