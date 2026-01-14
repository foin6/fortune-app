"""
Pydantic 模型定义
用于 BaziReport 数据结构验证
"""
from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class CangGan(BaseModel):
    """藏干"""
    gan: str = Field(..., description="天干")
    score: int = Field(..., description="分数")


class PillarDetail(BaseModel):
    """四柱详情"""
    name: str = Field(..., description="柱名称（年柱/月柱/日柱/时柱）")
    gan: str = Field(..., description="天干")
    zhi: str = Field(..., description="地支")
    gan_zhi: str = Field(..., description="干支组合")
    cang_gan: List[CangGan] = Field(default=[], description="藏干列表")
    na_yin: str = Field(default="", description="纳音五行")
    xing_yun: str = Field(default="", description="星运（十二长生）")
    zi_zuo: str = Field(default="", description="自坐（仅日柱有值）")
    gan_wuxing: str = Field(default="", description="天干五行")
    zhi_wuxing: str = Field(default="", description="地支五行")
    shi_shen: str = Field(default="", description="十神")


class SiZhu(BaseModel):
    """四柱"""
    year: str = Field(..., description="年柱")
    month: str = Field(..., description="月柱")
    day: str = Field(..., description="日柱")
    hour: str = Field(..., description="时柱")


class ShiShen(BaseModel):
    """十神配置"""
    year_shi_shen: str = Field(..., description="年柱十神")
    month_shi_shen: str = Field(..., description="月柱十神")
    day_shi_shen: str = Field(..., description="日柱十神")
    hour_shi_shen: str = Field(..., description="时柱十神")


class Chart(BaseModel):
    """四柱图表"""
    pillars: List[PillarDetail] = Field(..., description="四柱详细信息")
    si_zhu: SiZhu = Field(..., description="四柱干支")
    shi_shen: ShiShen = Field(..., description="十神配置")
    day_gan: str = Field(..., description="日主天干")
    day_zhi: str = Field(..., description="日主地支")


class FiveElementsScores(BaseModel):
    """五行得分"""
    wood: int = Field(0, alias="木", description="木")
    fire: int = Field(0, alias="火", description="火")
    earth: int = Field(0, alias="土", description="土")
    metal: int = Field(0, alias="金", description="金")
    water: int = Field(0, alias="水", description="水")


class FiveElementsPercentages(BaseModel):
    """五行占比"""
    wood: float = Field(0.0, alias="木", description="木占比")
    fire: float = Field(0.0, alias="火", description="火占比")
    earth: float = Field(0.0, alias="土", description="土占比")
    metal: float = Field(0.0, alias="金", description="金占比")
    water: float = Field(0.0, alias="水", description="水占比")


class FiveElements(BaseModel):
    """五行能量分析"""
    scores: Dict[str, int] = Field(..., description="五行得分")
    percentages: Dict[str, float] = Field(..., description="五行占比")
    strongest: str = Field(..., description="最旺五行")
    weakest: str = Field(..., description="最弱五行")
    missing: str = Field(..., description="缺失五行描述")
    same_kind: List[str] = Field(default=[], description="同类五行（生我、同我）")
    different_kind: List[str] = Field(default=[], description="异类五行（我生、我克、克我）")
    details: List[str] = Field(default=[], description="详细计算过程")


class Gods(BaseModel):
    """用神分析"""
    useful_god: str = Field(..., description="主要用神")
    useful_gods: List[str] = Field(..., description="所有用神列表")
    favorable_god: str = Field(default="", description="喜神")
    taboo_god: str = Field(..., description="主要忌神")
    taboo_gods: List[str] = Field(..., description="所有忌神列表")
    day_gan: str = Field(..., description="日主天干")
    day_wuxing: str = Field(..., description="日主五行")
    is_strong: bool = Field(..., description="日主是否偏强")
    tong_dang_score: int = Field(..., description="同党得分")
    yi_dang_score: int = Field(..., description="异党得分")
    suggestions: Dict[str, str] = Field(default={}, description="建议（幸运色、方位等）")


class DaYun(BaseModel):
    """大运"""
    age_start: int = Field(..., description="起始年龄")
    age_end: int = Field(..., description="结束年龄")
    gan: str = Field(..., description="大运天干")
    zhi: str = Field(..., description="大运地支")
    gan_zhi: str = Field(..., description="大运干支组合")


class BaziResult(BaseModel):
    """八字分析结果（BaziReport）"""
    chart: Chart = Field(..., description="四柱详情")
    five_elements: FiveElements = Field(..., description="五行能量分析")
    gods: Gods = Field(..., description="用神分析")
    da_yun: List[DaYun] = Field(..., description="大运列表")
    true_solar_time: str = Field(..., description="真太阳时")

    class Config:
        json_schema_extra = {
            "example": {
                "chart": {
                    "pillars": [
                        {
                            "name": "年柱",
                            "gan": "庚",
                            "zhi": "午",
                            "gan_zhi": "庚午",
                            "cang_gan": [{"gan": "丁", "score": 5}],
                            "na_yin": "土",
                            "xing_yun": "沐浴",
                            "shi_shen": "比肩"
                        }
                    ],
                    "si_zhu": {
                        "year": "庚午",
                        "month": "辛巳",
                        "day": "庚辰",
                        "hour": "癸未"
                    },
                    "day_gan": "庚",
                    "day_zhi": "辰"
                },
                "five_elements": {
                    "scores": {"木": 4, "火": 23, "土": 26, "金": 16, "水": 6},
                    "percentages": {"木": 5.08, "火": 29.11, "土": 32.91, "金": 20.25, "水": 7.59},
                    "strongest": "土",
                    "weakest": "木",
                    "same_kind": ["土", "金"],
                    "different_kind": ["火", "水", "木"]
                },
                "gods": {
                    "useful_god": "水",
                    "useful_gods": ["水", "金"],
                    "favorable_god": "水",
                    "taboo_god": "火",
                    "day_gan": "庚",
                    "day_wuxing": "金",
                    "is_strong": False,
                    "suggestions": {
                        "lucky_color": "黑色、蓝色",
                        "lucky_direction": "北方",
                        "lucky_element": "水"
                    }
                }
            }
        }
