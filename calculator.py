"""
命理计算核心模块
使用 lunar_python 进行真太阳时转换和八字排盘
"""
from datetime import datetime
from typing import Dict, List, Tuple, Optional, Any
from lunar_python import Lunar, Solar
from lunar_python.util import LunarUtil


class FortuneCalculator:
    """命理计算器"""
    
    # 天干
    TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
    # 地支
    DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
    # 十神
    SHI_SHEN = {
        '比肩': 0, '劫财': 1, '食神': 2, '伤官': 3, '偏财': 4,
        '正财': 5, '七杀': 6, '正官': 7, '偏印': 8, '正印': 9
    }
    
    # 五行
    WU_XING = ['木', '火', '土', '金', '水']
    
    # 天干五行对应
    TIAN_GAN_WUXING = {
        '甲': '木', '乙': '木',
        '丙': '火', '丁': '火',
        '戊': '土', '己': '土',
        '庚': '金', '辛': '金',
        '壬': '水', '癸': '水'
    }
    
    # 地支五行对应
    DI_ZHI_WUXING = {
        '子': '水', '丑': '土', '寅': '木', '卯': '木',
        '辰': '土', '巳': '火', '午': '火', '未': '土',
        '申': '金', '酉': '金', '戌': '土', '亥': '水'
    }
    
    # 地支藏干（本气、中气、余气）
    DI_ZHI_CANG_GAN = {
        '子': [('癸', 5)],  # 本气
        '丑': [('己', 5), ('癸', 3), ('辛', 1)],  # 本气、中气、余气
        '寅': [('甲', 5), ('丙', 3), ('戊', 1)],
        '卯': [('乙', 5)],
        '辰': [('戊', 5), ('乙', 3), ('癸', 1)],
        '巳': [('丙', 5), ('戊', 3), ('庚', 1)],
        '午': [('丁', 5), ('己', 3)],
        '未': [('己', 5), ('丁', 3), ('乙', 1)],
        '申': [('庚', 5), ('壬', 3), ('戊', 1)],
        '酉': [('辛', 5)],
        '戌': [('戊', 5), ('辛', 3), ('丁', 1)],
        '亥': [('壬', 5), ('甲', 3)]
    }
    
    # 纳音五行（完整名称）
    NA_YIN_FULL = {
        '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
        '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
        '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
        '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
        '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
        '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
        '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
        '壬辰': '长流水', '癸巳': '长流水', '甲午': '砂中金', '乙未': '砂中金',
        '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
        '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
        '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
        '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
        '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
        '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
        '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水'
    }
    
    # 纳音五行（简化版，仅五行）
    # 十二长生（星运）表
    CHANG_SHENG_TABLE = {
        '甲': {'亥': '长生', '子': '沐浴', '丑': '冠带', '寅': '临官', '卯': '帝旺', '辰': '衰', '巳': '病', '午': '死', '未': '墓', '申': '绝', '酉': '胎', '戌': '养'},
        '乙': {'午': '长生', '巳': '沐浴', '辰': '冠带', '卯': '临官', '寅': '帝旺', '丑': '衰', '子': '病', '亥': '死', '戌': '墓', '酉': '绝', '申': '胎', '未': '养'},
        '丙': {'寅': '长生', '卯': '沐浴', '辰': '冠带', '巳': '临官', '午': '帝旺', '未': '衰', '申': '病', '酉': '死', '戌': '墓', '亥': '绝', '子': '胎', '丑': '养'},
        '丁': {'酉': '长生', '申': '沐浴', '未': '冠带', '午': '临官', '巳': '帝旺', '辰': '衰', '卯': '病', '寅': '死', '丑': '墓', '子': '绝', '亥': '胎', '戌': '养'},
        '戊': {'寅': '长生', '卯': '沐浴', '辰': '冠带', '巳': '临官', '午': '帝旺', '未': '衰', '申': '病', '酉': '死', '戌': '墓', '亥': '绝', '子': '胎', '丑': '养'},
        '己': {'酉': '长生', '申': '沐浴', '未': '冠带', '午': '临官', '巳': '帝旺', '辰': '衰', '卯': '病', '寅': '死', '丑': '墓', '子': '绝', '亥': '胎', '戌': '养'},
        '庚': {'巳': '长生', '午': '沐浴', '未': '冠带', '申': '临官', '酉': '帝旺', '戌': '衰', '亥': '病', '子': '死', '丑': '墓', '寅': '绝', '卯': '胎', '辰': '养'},
        '辛': {'子': '长生', '亥': '沐浴', '戌': '冠带', '酉': '临官', '申': '帝旺', '未': '衰', '午': '病', '巳': '死', '辰': '墓', '卯': '绝', '寅': '胎', '丑': '养'},
        '壬': {'申': '长生', '酉': '沐浴', '戌': '冠带', '亥': '临官', '子': '帝旺', '丑': '衰', '寅': '病', '卯': '死', '辰': '墓', '巳': '绝', '午': '胎', '未': '养'},
        '癸': {'卯': '长生', '寅': '沐浴', '丑': '冠带', '子': '临官', '亥': '帝旺', '戌': '衰', '酉': '病', '申': '死', '未': '墓', '午': '绝', '巳': '胎', '辰': '养'}
    }
    
    # 五行对应的幸运色和方位
    WUXING_SUGGESTIONS = {
        '木': {'lucky_color': '绿色、青色', 'lucky_direction': '东方', 'lucky_element': '木'},
        '火': {'lucky_color': '红色、紫色', 'lucky_direction': '南方', 'lucky_element': '火'},
        '土': {'lucky_color': '黄色、棕色', 'lucky_direction': '中央', 'lucky_element': '土'},
        '金': {'lucky_color': '白色、金色', 'lucky_direction': '西方', 'lucky_element': '金'},
        '水': {'lucky_color': '黑色、蓝色', 'lucky_direction': '北方', 'lucky_element': '水'}
    }
    
    # 纳音五行（简化版，仅五行）
    NA_YIN = {
        '甲子': '金', '乙丑': '金', '丙寅': '火', '丁卯': '火',
        '戊辰': '木', '己巳': '木', '庚午': '土', '辛未': '土',
        '壬申': '金', '癸酉': '金', '甲戌': '火', '乙亥': '火',
        '丙子': '水', '丁丑': '水', '戊寅': '土', '己卯': '土',
        '庚辰': '金', '辛巳': '金', '壬午': '木', '癸未': '木',
        '甲申': '水', '乙酉': '水', '丙戌': '土', '丁亥': '土',
        '戊子': '火', '己丑': '火', '庚寅': '木', '辛卯': '木',
        '壬辰': '水', '癸巳': '水', '甲午': '金', '乙未': '金',
        '丙申': '火', '丁酉': '火', '戊戌': '木', '己亥': '木',
        '庚子': '土', '辛丑': '土', '壬寅': '金', '癸卯': '金',
        '甲辰': '火', '乙巳': '火', '丙午': '水', '丁未': '水',
        '戊申': '土', '己酉': '土', '庚戌': '金', '辛亥': '金',
        '壬子': '木', '癸丑': '木', '甲寅': '水', '乙卯': '水',
        '丙辰': '土', '丁巳': '土', '戊午': '火', '己未': '火',
        '庚申': '木', '辛酉': '木', '壬戌': '水', '癸亥': '水'
    }
    
    # 纳音五行（完整名称，如"海中金"、"大林木"等）
    NA_YIN_FULL = {
        '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
        '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
        '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
        '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
        '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
        '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
        '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
        '壬辰': '长流水', '癸巳': '长流水', '甲午': '砂中金', '乙未': '砂中金',
        '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
        '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
        '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
        '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
        '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
        '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
        '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水'
    }
    
    def __init__(self):
        pass
    
    def calculate_true_solar_time(
        self, 
        birth_date: str, 
        birth_time: str, 
        lng: float, 
        lat: float
    ) -> datetime:
        """
        计算真太阳时
        
        Args:
            birth_date: 公历日期，格式 "YYYY-MM-DD"
            birth_time: 时间，格式 "HH:MM"
            lng: 经度（东经为正，西经为负）
            lat: 纬度（北纬为正，南纬为负）
        
        Returns:
            真太阳时 datetime 对象
        """
        # 解析输入时间
        dt_str = f"{birth_date} {birth_time}"
        local_time = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        
        # 计算时差（经度差转换为时间差）
        # 标准时区（北京时间 UTC+8）对应的经度是 120°E
        standard_lng = 120.0
        lng_diff = lng - standard_lng
        
        # 经度差转换为时间差（1度 = 4分钟）
        time_diff_minutes = lng_diff * 4
        
        # 计算真太阳时
        true_solar_time = local_time.timestamp() + time_diff_minutes * 60
        
        return datetime.fromtimestamp(true_solar_time)
    
    def get_si_zhu(
        self, 
        true_solar_time: datetime
    ) -> Dict[str, str]:
        """
        计算四柱（年、月、日、时柱）
        
        Args:
            true_solar_time: 真太阳时
        
        Returns:
            包含四柱的字典
        """
        # 转换为农历
        solar = Solar.fromYmd(
            true_solar_time.year,
            true_solar_time.month,
            true_solar_time.day
        )
        lunar = solar.getLunar()
        
        # 获取八字
        bazi = lunar.getEightChar()
        
        # 年柱
        year_gan = bazi.getYearGan()
        year_zhi = bazi.getYearZhi()
        
        # 月柱
        month_gan = bazi.getMonthGan()
        month_zhi = bazi.getMonthZhi()
        
        # 日柱
        day_gan = bazi.getDayGan()
        day_zhi = bazi.getDayZhi()
        
        # 时柱（需要根据真太阳时的小时计算）
        hour = true_solar_time.hour
        time_zhi_index = self._get_time_zhi_index(hour)
        time_zhi = self.DI_ZHI[time_zhi_index]
        
        # 根据日干和时支计算时干（五鼠遁口诀）
        # 甲己还加甲，乙庚丙作初，丙辛从戊起，丁壬庚子居，戊癸何方发，壬子是真途
        day_gan_index = self.TIAN_GAN.index(day_gan)
        # 根据日干确定子时的天干
        if day_gan in ['甲', '己']:
            zi_gan_index = 0  # 甲
        elif day_gan in ['乙', '庚']:
            zi_gan_index = 2  # 丙
        elif day_gan in ['丙', '辛']:
            zi_gan_index = 4  # 戊
        elif day_gan in ['丁', '壬']:
            zi_gan_index = 6  # 庚
        else:  # 戊、癸
            zi_gan_index = 8  # 壬
        
        # 从子时开始，根据时支索引计算时干
        time_gan_index = (zi_gan_index + time_zhi_index) % 10
        time_gan = self.TIAN_GAN[time_gan_index]
        
        return {
            'year': f"{year_gan}{year_zhi}",
            'month': f"{month_gan}{month_zhi}",
            'day': f"{day_gan}{day_zhi}",
            'hour': f"{time_gan}{time_zhi}",
            'year_gan': year_gan,
            'year_zhi': year_zhi,
            'month_gan': month_gan,
            'month_zhi': month_zhi,
            'day_gan': day_gan,
            'day_zhi': day_zhi,
            'hour_gan': time_gan,
            'hour_zhi': time_zhi
        }
    
    def _get_time_zhi_index(self, hour: int) -> int:
        """根据小时获取时支索引"""
        # 子时: 23:00-00:59, 丑时: 01:00-02:59, ...
        if hour == 23 or hour == 0:
            return 0  # 子
        return (hour + 1) // 2
    
    def calculate_shi_shen(self, day_gan: str, other_gan: str) -> str:
        """
        计算十神
        
        Args:
            day_gan: 日干
            other_gan: 其他天干（年干、月干、时干）
        
        Returns:
            十神名称
        """
        day_index = self.TIAN_GAN.index(day_gan)
        other_index = self.TIAN_GAN.index(other_gan)
        
        # 计算天干差
        diff = (other_index - day_index) % 10
        
        # 十神对照表（以日干为基准）
        shi_shen_map = {
            0: '比肩',  # 同我
            1: '劫财',  # 同我（阴阳不同）
            2: '食神',  # 我生
            3: '伤官',  # 我生（阴阳不同）
            4: '偏财',  # 我克
            5: '正财',  # 我克（阴阳不同）
            6: '七杀',  # 克我
            7: '正官',  # 克我（阴阳不同）
            8: '偏印',  # 生我
            9: '正印'   # 生我（阴阳不同）
        }
        
        # 判断阴阳
        day_yin_yang = day_index % 2  # 0为阳，1为阴
        other_yin_yang = other_index % 2
        
        if diff == 0:
            return '比肩' if day_yin_yang == other_yin_yang else '劫财'
        elif diff == 1:
            return '正印' if day_yin_yang == other_yin_yang else '偏印'
        elif diff == 2:
            return '偏印' if day_yin_yang == other_yin_yang else '正印'
        elif diff == 3:
            return '正官' if day_yin_yang == other_yin_yang else '七杀'
        elif diff == 4:
            return '七杀' if day_yin_yang == other_yin_yang else '正官'
        elif diff == 5:
            return '正财' if day_yin_yang == other_yin_yang else '偏财'
        elif diff == 6:
            return '偏财' if day_yin_yang == other_yin_yang else '正财'
        elif diff == 7:
            return '伤官' if day_yin_yang == other_yin_yang else '食神'
        elif diff == 8:
            return '食神' if day_yin_yang == other_yin_yang else '伤官'
        else:  # diff == 9
            return '劫财' if day_yin_yang == other_yin_yang else '比肩'
    
    def get_all_shi_shen(self, si_zhu: Dict[str, str]) -> Dict[str, str]:
        """
        计算所有十神
        
        Args:
            si_zhu: 四柱字典
        
        Returns:
            包含各柱十神的字典
        """
        day_gan = si_zhu['day_gan']
        
        return {
            'year_shi_shen': self.calculate_shi_shen(day_gan, si_zhu['year_gan']),
            'month_shi_shen': self.calculate_shi_shen(day_gan, si_zhu['month_gan']),
            'day_shi_shen': '日主',  # 日柱为自己
            'hour_shi_shen': self.calculate_shi_shen(day_gan, si_zhu['hour_gan'])
        }
    
    def calculate_da_yun(
        self, 
        si_zhu: Dict[str, str], 
        gender: str,
        birth_date: str
    ) -> List[Dict[str, any]]:
        """
        计算大运
        
        Args:
            si_zhu: 四柱字典
            gender: 性别（'male' 或 'female'）
            birth_date: 出生日期
        
        Returns:
            大运列表，每个大运包含起始年龄、天干、地支等信息
        """
        # 获取年柱和月柱
        year_gan = si_zhu['year_gan']
        month_gan = si_zhu['month_gan']
        month_zhi = si_zhu['month_zhi']
        
        # 判断阳年阴年（天干：甲丙戊庚壬为阳，乙丁己辛癸为阴）
        yang_years = ['甲', '丙', '戊', '庚', '壬']
        is_yang_year = year_gan in yang_years
        
        # 判断顺排还是逆排
        # 阳男阴女顺排，阴男阳女逆排
        is_male = gender.lower() in ['male', '男', 'm']
        is_shun = (is_yang_year and is_male) or (not is_yang_year and not is_male)
        
        # 获取月柱索引
        month_gan_index = self.TIAN_GAN.index(month_gan)
        month_zhi_index = self.DI_ZHI.index(month_zhi)
        
        # 计算大运（每10年一运）
        da_yun_list = []
        start_age = 0  # 通常从0岁或几岁开始起运，这里简化处理
        
        for i in range(8):  # 计算8个大运（80年）
            if is_shun:
                gan_index = (month_gan_index + i + 1) % 10
                zhi_index = (month_zhi_index + i + 1) % 12
            else:
                gan_index = (month_gan_index - i - 1) % 10
                zhi_index = (month_zhi_index - i - 1) % 12
            
            da_yun_list.append({
                'age_start': start_age + i * 10,
                'age_end': start_age + (i + 1) * 10,
                'gan': self.TIAN_GAN[gan_index],
                'zhi': self.DI_ZHI[zhi_index],
                'gan_zhi': f"{self.TIAN_GAN[gan_index]}{self.DI_ZHI[zhi_index]}"
            })
        
        return da_yun_list
    
    def calculate_all(
        self,
        birth_date: str,
        birth_time: str,
        lng: float,
        lat: float,
        gender: str
    ) -> Dict[str, any]:
        """
        完整计算流程
        
        Args:
            birth_date: 公历日期
            birth_time: 时间
            lng: 经度
            lat: 纬度
            gender: 性别
        
        Returns:
            完整的排盘结果
        """
        # 1. 计算真太阳时
        true_solar_time = self.calculate_true_solar_time(
            birth_date, birth_time, lng, lat
        )
        
        # 2. 计算四柱
        si_zhu = self.get_si_zhu(true_solar_time)
        
        # 3. 计算十神
        shi_shen = self.get_all_shi_shen(si_zhu)
        
        # 4. 计算大运
        da_yun = self.calculate_da_yun(si_zhu, gender, birth_date)
        
        return {
            'true_solar_time': true_solar_time.strftime("%Y-%m-%d %H:%M:%S"),
            'si_zhu': si_zhu,
            'shi_shen': shi_shen,
            'da_yun': da_yun,
            'day_gan': si_zhu['day_gan'],
            'day_zhi': si_zhu['day_zhi']
        }
    
    def get_cang_gan(self, zhi: str) -> List[Dict[str, Any]]:
        """
        获取地支藏干
        
        Args:
            zhi: 地支
        
        Returns:
            藏干列表，每个包含天干和分数
        """
        return [
            {'gan': gan, 'score': score}
            for gan, score in self.DI_ZHI_CANG_GAN.get(zhi, [])
        ]
    
    def get_na_yin(self, gan_zhi: str) -> str:
        """
        获取纳音五行（简化版，仅五行）
        
        Args:
            gan_zhi: 干支组合（如 "甲子"）
        
        Returns:
            纳音五行（如 "金"）
        """
        return self.NA_YIN.get(gan_zhi, '')
    
    def get_na_yin_full(self, gan_zhi: str) -> str:
        """
        获取纳音五行（完整名称）
        
        Args:
            gan_zhi: 干支组合（如 "甲子"）
        
        Returns:
            纳音完整名称（如 "海中金"）
        """
        return self.NA_YIN_FULL.get(gan_zhi, '')
    
    def get_kong_wang(self, day_gan: str, day_zhi: str) -> str:
        """
        计算空亡（旬空）
        
        空亡是指在六十甲子循环中，每个十天干与十二地支组合时，多出的两个地支被视为"空亡"。
        计算方法：
        1. 确定日柱的天干和地支序号
        2. 计算 (地支序号 - 天干序号) % 10，得到旬空起始位置
        3. 空亡地支是该位置和下一个位置对应的两个地支
        
        Args:
            day_gan: 日柱天干
            day_zhi: 日柱地支
        
        Returns:
            空亡地支，格式如 "子、丑" 或 "戌、亥"
        """
        gan_index = self.TIAN_GAN.index(day_gan)
        zhi_index = self.DI_ZHI.index(day_zhi)
        
        # 计算空亡地支序号
        # 空亡地支 = (地支序号 - 天干序号) % 10 对应的两个地支
        diff = (zhi_index - gan_index) % 10
        
        # 空亡地支是 diff 和 diff+1 对应的地支（在12地支中循环）
        kong_wang_indices = [diff, (diff + 1) % 12]
        
        # 转换为地支名称
        kong_wang_zhi = [self.DI_ZHI[i] for i in kong_wang_indices]
        
        return '、'.join(kong_wang_zhi)
    
    def get_shen_sha(self, gan: str, zhi: str, month: int, pillar_key: str, year_zhi: Optional[str] = None, day_zhi: Optional[str] = None) -> List[str]:
        """
        计算神煞
        
        Args:
            gan: 天干
            zhi: 地支
            month: 月份（1-12）
            pillar_key: 柱的键（year/month/day/hour）
            year_zhi: 年支（用于计算驿马等）
            day_zhi: 日支（用于计算驿马等）
        
        Returns:
            神煞列表
        """
        shen_sha_list = []
        
        # 天德贵人（根据月份和天干地支）
        # 天德贵人的查找表（简化版）
        tian_de_gui_ren = {
            1: {'天干': '丁', '地支': '寅'}, 2: {'天干': '申', '地支': '申'},
            3: {'天干': '壬', '地支': '亥'}, 4: {'天干': '辛', '地支': '申'},
            5: {'天干': '亥', '地支': '亥'}, 6: {'天干': '甲', '地支': '寅'},
            7: {'天干': '癸', '地支': '申'}, 8: {'天干': '寅', '地支': '寅'},
            9: {'天干': '丙', '地支': '寅'}, 10: {'天干': '乙', '地支': '申'},
            11: {'天干': '巳', '地支': '巳'}, 12: {'天干': '庚', '地支': '申'}
        }
        if month in tian_de_gui_ren:
            tian_de = tian_de_gui_ren[month]
            if gan == tian_de.get('天干', '') or zhi == tian_de.get('地支', ''):
                shen_sha_list.append('天德贵人')
        
        # 月德贵人（根据月份和天干）
        yue_de_gui_ren = {
            1: '丙', 2: '甲', 3: '壬', 4: '庚', 5: '丙',
            6: '甲', 7: '壬', 8: '庚', 9: '丙', 10: '甲', 11: '壬', 12: '庚'
        }
        if month in yue_de_gui_ren and gan == yue_de_gui_ren[month]:
            shen_sha_list.append('月德贵人')
        
        # 天乙贵人（根据天干）
        tian_yi_gui_ren = {
            '甲': ['丑', '未'], '乙': ['子', '申'], '丙': ['亥', '酉'],
            '丁': ['亥', '酉'], '戊': ['丑', '未'], '己': ['子', '申'],
            '庚': ['丑', '未'], '辛': ['午', '寅'], '壬': ['卯', '巳'],
            '癸': ['卯', '巳']
        }
        if gan in tian_yi_gui_ren and zhi in tian_yi_gui_ren[gan]:
            shen_sha_list.append('天乙贵人')
        
        # 桃花（根据年支或日支）
        # 寅午戌见卯，申子辰见酉，巳酉丑见午，亥卯未见子
        tao_hua_map = {
            '寅': '卯', '午': '卯', '戌': '卯',
            '申': '酉', '子': '酉', '辰': '酉',
            '巳': '午', '酉': '午', '丑': '午',
            '亥': '子', '卯': '子', '未': '子'
        }
        # 需要年支或日支来判断
        if year_zhi and year_zhi in tao_hua_map and zhi == tao_hua_map[year_zhi]:
            shen_sha_list.append('桃花')
        if day_zhi and day_zhi in tao_hua_map and zhi == tao_hua_map[day_zhi]:
            shen_sha_list.append('桃花')
        
        # 文昌（根据天干）
        wen_chang = {
            '甲': '巳', '乙': '午', '丙': '申', '丁': '酉',
            '戊': '申', '己': '酉', '庚': '亥', '辛': '子',
            '壬': '寅', '癸': '卯'
        }
        if gan in wen_chang and zhi == wen_chang[gan]:
            shen_sha_list.append('文昌')
        
        # 驿马（根据年支或日支）
        # 寅午戌见申，申子辰见寅，巳酉丑见亥，亥卯未见巳
        yi_ma_map = {
            '寅': '申', '午': '申', '戌': '申',
            '申': '寅', '子': '寅', '辰': '寅',
            '巳': '亥', '酉': '亥', '丑': '亥',
            '亥': '巳', '卯': '巳', '未': '巳'
        }
        if year_zhi and year_zhi in yi_ma_map and zhi == yi_ma_map[year_zhi]:
            shen_sha_list.append('驿马')
        if day_zhi and day_zhi in yi_ma_map and zhi == yi_ma_map[day_zhi]:
            shen_sha_list.append('驿马')
        
        return shen_sha_list
    
    def get_xing_yun(self, day_gan: str, zhi: str) -> str:
        """
        获取星运（十二长生）
        
        Args:
            day_gan: 日主天干
            zhi: 地支
        
        Returns:
            星运名称（如：长生、沐浴、帝旺等）
        """
        return self.CHANG_SHENG_TABLE.get(day_gan, {}).get(zhi, '')
    
    def determine_pattern(self, si_zhu: Dict[str, str], shi_shen: Dict[str, str]) -> str:
        """
        判定格局
        
        格局判定规则：
        1. 以月令为主，看月干透出的十神
        2. 如果月干无透，看月支藏干透出的十神
        3. 如果都无，看其他柱的十神配置
        
        Args:
            si_zhu: 四柱字典
            shi_shen: 十神字典
        
        Returns:
            格局名称（如：食神格、伤官格、正官格等）
        """
        # 优先看月干透出的十神
        month_shi_shen = shi_shen.get('month_shi_shen', '')
        
        # 格局映射
        pattern_map = {
            '食神': '食神格',
            '伤官': '伤官格',
            '正官': '正官格',
            '七杀': '七杀格',
            '正印': '正印格',
            '偏印': '偏印格',
            '正财': '正财格',
            '偏财': '偏财格',
            '比肩': '比肩格',
            '劫财': '劫财格'
        }
        
        if month_shi_shen in pattern_map:
            return pattern_map[month_shi_shen]
        
        # 如果月干无透，看月支藏干
        month_zhi = si_zhu.get('month_zhi', '')
        cang_gans = self.get_cang_gan(month_zhi)
        if cang_gans:
            # 取本气藏干
            main_cang_gan = cang_gans[0]['gan']
            main_cang_shi_shen = self.calculate_shi_shen(si_zhu['day_gan'], main_cang_gan)
            if main_cang_shi_shen in pattern_map:
                return pattern_map[main_cang_shi_shen]
        
        # 如果都无，看其他柱的十神配置（优先时柱）
        for pillar_key in ['hour', 'year']:
            shi_shen_key = f'{pillar_key}_shi_shen'
            pillar_shi_shen = shi_shen.get(shi_shen_key, '')
            if pillar_shi_shen in pattern_map:
                return pattern_map[pillar_shi_shen]
        
        # 默认：根据日主强弱判断
        return '正格'  # 正格（普通格局）
    
    def extract_personality_tags(self, day_gan: str, day_wuxing: str, pattern_name: str, is_strong: bool) -> List[str]:
        """
        提取核心性格关键词
        
        Args:
            day_gan: 日主天干
            day_wuxing: 日主五行
            pattern_name: 格局名称
            is_strong: 日主是否强
        
        Returns:
            性格标签列表
        """
        tags = []
        
        # 根据日主天干提取基础性格
        gan_personality = {
            '甲': ['正直', '积极', '有领导力'],
            '乙': ['温和', '细腻', '有韧性'],
            '丙': ['热情', '光明', '积极'],
            '丁': ['细致', '温暖', '有耐心'],
            '戊': ['诚实', '稳重', '包容'],
            '己': ['温和', '包容', '有责任感'],
            '庚': ['刚强', '果断', '有原则'],
            '辛': ['细腻', '精致', '有毅力'],
            '壬': ['聪明', '灵动', '格局大'],
            '癸': ['温柔', '智慧', '适应力强']
        }
        
        if day_gan in gan_personality:
            tags.extend(gan_personality[day_gan])
        
        # 根据格局添加性格特征
        pattern_personality = {
            '食神格': ['有创造力', '善于表达'],
            '伤官格': ['才华横溢', '不拘一格'],
            '正官格': ['有责任感', '遵守规则'],
            '七杀格': ['有魄力', '敢于冒险'],
            '正印格': ['有智慧', '善于学习'],
            '偏印格': ['思维独特', '有洞察力'],
            '正财格': ['务实', '善于理财'],
            '偏财格': ['灵活', '善于把握机会'],
            '比肩格': ['独立', '有主见'],
            '劫财格': ['竞争意识强', '有冲劲']
        }
        
        if pattern_name in pattern_personality:
            tags.extend(pattern_personality[pattern_name][:2])  # 只取前2个
        
        # 根据强弱添加特征
        if is_strong:
            tags.append('自信')
        else:
            tags.append('谦逊')
        
        # 去重并限制数量
        return list(dict.fromkeys(tags))[:5]  # 最多5个标签
    
    def get_wuxing_status(self, wuxing: str, scores: Dict[str, float], strongest: str, weakest: str) -> str:
        """
        计算五行状态（相、死、旺、囚、休）
        
        根据五行得分判断状态：
        - 旺：得分最高
        - 相：得分较高（第二高）
        - 死：得分最低
        - 囚：得分较低（第二低）
        - 休：中等
        
        Args:
            wuxing: 五行名称
            scores: 五行得分字典
            strongest: 最旺的五行
            weakest: 最弱的五行
        
        Returns:
            状态名称（相、死、旺、囚、休）
        """
        if wuxing == strongest:
            return '旺'
        elif wuxing == weakest:
            return '死'
        else:
            # 计算排序
            sorted_wuxing = sorted(scores.items(), key=lambda x: x[1], reverse=True)
            wuxing_rank = [w[0] for w in sorted_wuxing].index(wuxing)
            if wuxing_rank == 1:
                return '相'
            elif wuxing_rank == len(sorted_wuxing) - 2:
                return '囚'
            else:
                return '休'
    
    def calculate_gods_analysis(self, yong_shen: Dict[str, Any], wuxing_energy: Dict[str, Any]) -> Dict[str, Any]:
        """
        计算用神分析（用神、喜神、忌神、仇神、闲神）
        
        Args:
            yong_shen: 用神分析结果
            wuxing_energy: 五行能量分析结果
        
        Returns:
            用神分析字典
        """
        day_wuxing = yong_shen['day_wuxing']
        is_strong = yong_shen['is_strong']
        useful_gods = yong_shen.get('useful_gods', [])
        taboo_gods = yong_shen.get('taboo_gods', [])
        
        # 用神：命局最需要的五行
        yong_shen_wuxing = useful_gods[0] if useful_gods else ''
        yong_shen_desc = f"命局最需要的五行，能平衡命局能量" if yong_shen_wuxing else ""
        
        # 喜神：对命局有利的五行（通常是用神之外的其他有利五行）
        xi_shen_wuxing = useful_gods[1] if len(useful_gods) > 1 else (useful_gods[0] if useful_gods else '')
        xi_shen_desc = f"对命局有利的五行，能辅助用神发挥作用" if xi_shen_wuxing else ""
        
        # 忌神：对命局不利的五行
        ji_shen_wuxing = taboo_gods[0] if taboo_gods else ''
        ji_shen_desc = f"对命局不利的五行，会破坏命局平衡" if ji_shen_wuxing else ""
        
        # 仇神：克制用神的五行
        # 简化：如果忌神克制用神，则忌神也是仇神
        chou_shen_wuxing = ''
        chou_shen_desc = ''
        if yong_shen_wuxing and ji_shen_wuxing:
            # 检查是否克制关系
            ke_wo_map = {'木': '金', '火': '水', '土': '木', '金': '火', '水': '土'}
            if ke_wo_map.get(ji_shen_wuxing) == yong_shen_wuxing:
                chou_shen_wuxing = ji_shen_wuxing
                chou_shen_desc = "克制用神的五行，需要特别注意"
        
        # 闲神：对命局影响不大的五行
        all_wuxing = ['木', '火', '土', '金', '水']
        used_wuxing = set(useful_gods + taboo_gods)
        xian_shen_list = [w for w in all_wuxing if w not in used_wuxing]
        xian_shen_wuxing = xian_shen_list[0] if xian_shen_list else ''
        xian_shen_desc = "对命局影响不大的五行" if xian_shen_wuxing else ""
        
        return {
            'yong_shen': {
                'name': yong_shen_wuxing,
                'desc': yong_shen_desc
            },
            'xi_shen': {
                'name': xi_shen_wuxing,
                'desc': xi_shen_desc
            },
            'ji_shen': {
                'name': ji_shen_wuxing,
                'desc': ji_shen_desc
            },
            'chou_shen': {
                'name': chou_shen_wuxing,
                'desc': chou_shen_desc
            },
            'xian_shen': {
                'name': xian_shen_wuxing,
                'desc': xian_shen_desc
            }
        }
    
    def calculate_wuxing_energy(self, si_zhu: Dict[str, str]) -> Dict[str, Any]:
        """
        计算五行能量
        
        Args:
            si_zhu: 四柱字典
        
        Returns:
            五行能量分析结果
        """
        wuxing_scores = {'木': 0, '火': 0, '土': 0, '金': 0, '水': 0}
        wuxing_details = []
        
        # 遍历四柱
        pillars = [
            ('year', '年柱'),
            ('month', '月柱'),
            ('day', '日柱'),
            ('hour', '时柱')
        ]
        
        for pillar_key, pillar_name in pillars:
            gan = si_zhu[f'{pillar_key}_gan']
            zhi = si_zhu[f'{pillar_key}_zhi']
            
            # 天干五行得分（本气，5分）
            gan_wuxing = self.TIAN_GAN_WUXING.get(gan, '')
            if gan_wuxing:
                wuxing_scores[gan_wuxing] += 5
                wuxing_details.append(f"{pillar_name}{gan}：{gan_wuxing}+5")
            
            # 地支五行得分（本气，5分）
            zhi_wuxing = self.DI_ZHI_WUXING.get(zhi, '')
            if zhi_wuxing:
                wuxing_scores[zhi_wuxing] += 5
                wuxing_details.append(f"{pillar_name}{zhi}：{zhi_wuxing}+5")
            
            # 藏干五行得分
            cang_gans = self.get_cang_gan(zhi)
            for cang in cang_gans:
                cang_gan = cang['gan']
                cang_score = cang['score']
                cang_wuxing = self.TIAN_GAN_WUXING.get(cang_gan, '')
                if cang_wuxing:
                    wuxing_scores[cang_wuxing] += cang_score
                    wuxing_details.append(f"{pillar_name}{zhi}藏干{cang_gan}：{cang_wuxing}+{cang_score}")
        
        # 计算百分比
        total_score = sum(wuxing_scores.values())
        wuxing_percentages = {
            wuxing: round(score / total_score * 100, 2) if total_score > 0 else 0
            for wuxing, score in wuxing_scores.items()
        }
        
        # 找出最旺和最弱的五行
        sorted_wuxing = sorted(wuxing_scores.items(), key=lambda x: x[1], reverse=True)
        strongest = sorted_wuxing[0][0] if sorted_wuxing else ''
        weakest = sorted_wuxing[-1][0] if sorted_wuxing else ''
        
        # 分析缺失的五行
        missing_wuxing = [wx for wx, score in wuxing_scores.items() if score == 0]
        missing_text = f"缺{''.join(missing_wuxing)}" if missing_wuxing else "五行齐全"
        
        return {
            'scores': wuxing_scores,
            'percentages': wuxing_percentages,
            'strongest': strongest,
            'weakest': weakest,
            'missing': missing_text,
            'details': wuxing_details
        }
    
    def calculate_yong_shen(
        self, 
        si_zhu: Dict[str, str], 
        wuxing_energy: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        计算用神和忌神
        
        Args:
            si_zhu: 四柱字典
            wuxing_energy: 五行能量分析结果
        
        Returns:
            用神分析结果
        """
        day_gan = si_zhu['day_gan']
        day_wuxing = self.TIAN_GAN_WUXING.get(day_gan, '')
        
        # 计算同党和异党
        # 同党：生我（印）、同我（比劫）
        # 异党：我生（食伤）、我克（财）、克我（官杀）
        
        # 生我的五行（印）
        sheng_wo = {
            '木': '水', '火': '木', '土': '火',
            '金': '土', '水': '金'
        }
        
        # 我生的五行（食伤）
        wo_sheng = {
            '木': '火', '火': '土', '土': '金',
            '金': '水', '水': '木'
        }
        
        # 我克的五行（财）
        wo_ke = {
            '木': '土', '火': '金', '土': '水',
            '金': '木', '水': '火'
        }
        
        # 克我的五行（官杀）
        ke_wo = {
            '木': '金', '火': '水', '土': '木',
            '金': '火', '水': '土'
        }
        
        yin_wuxing = sheng_wo.get(day_wuxing, '')
        bi_jie_wuxing = day_wuxing  # 同我
        
        tong_dang_score = (
            wuxing_energy['scores'].get(yin_wuxing, 0) +
            wuxing_energy['scores'].get(bi_jie_wuxing, 0)
        )
        
        shi_shang_wuxing = wo_sheng.get(day_wuxing, '')
        cai_wuxing = wo_ke.get(day_wuxing, '')
        guan_sha_wuxing = ke_wo.get(day_wuxing, '')
        
        yi_dang_score = (
            wuxing_energy['scores'].get(shi_shang_wuxing, 0) +
            wuxing_energy['scores'].get(cai_wuxing, 0) +
            wuxing_energy['scores'].get(guan_sha_wuxing, 0)
        )
        
        # 判断日主强弱（精确算法）
        # 考虑：1. 同党异党得分比 2. 月令得地 3. 得势（天干比劫）
        month_zhi = si_zhu.get('month_zhi', '')
        day_zhi = si_zhu.get('day_zhi', '')
        
        # 月令得地判断（日主在月令是否得地）
        month_wuxing = self.DI_ZHI_WUXING.get(month_zhi, '')
        day_zhi_wuxing = self.DI_ZHI_WUXING.get(day_zhi, '')
        
        # 得地得分：月令和日支是否生助日主
        dedi_score = 0
        if month_wuxing == day_wuxing:  # 月令同我
            dedi_score += 10
        elif month_wuxing == sheng_wo.get(day_wuxing, ''):  # 月令生我
            dedi_score += 8
        elif month_wuxing == wo_ke.get(day_wuxing, ''):  # 月令我克（得财）
            dedi_score += 5
        elif month_wuxing == ke_wo.get(day_wuxing, ''):  # 月令克我（失地）
            dedi_score -= 5
        
        if day_zhi_wuxing == day_wuxing:  # 日支同我
            dedi_score += 5
        elif day_zhi_wuxing == sheng_wo.get(day_wuxing, ''):  # 日支生我
            dedi_score += 3
        
        # 得势判断：天干比劫数量
        deshi_score = 0
        for pillar_key in ['year', 'month', 'hour']:
            gan = si_zhu.get(f'{pillar_key}_gan', '')
            if gan == si_zhu['day_gan']:  # 比肩
                deshi_score += 3
            elif self.TIAN_GAN_WUXING.get(gan, '') == day_wuxing:  # 同五行但不同天干（劫财）
                deshi_score += 2
        
        # 综合判断
        total_tong_dang = tong_dang_score + dedi_score + deshi_score
        is_strong = total_tong_dang > yi_dang_score
        
        # 判断强弱程度
        diff = abs(total_tong_dang - yi_dang_score)
        if diff < 5:
            strength_status = '中和'
        elif is_strong:
            if diff > 20:
                strength_status = '强'
            else:
                strength_status = '偏强'
        else:
            if diff > 20:
                strength_status = '弱'
            else:
                strength_status = '偏弱'
        
        # 计算用神和忌神
        # 日主强：喜异党（泄、耗、克）
        # 日主弱：喜同党（生、扶）
        
        if is_strong:
            # 日主强，喜用神为异党（泄、耗、克）
            useful_gods = []
            if wuxing_energy['scores'].get(shi_shang_wuxing, 0) > 0:
                useful_gods.append(shi_shang_wuxing)
            if wuxing_energy['scores'].get(cai_wuxing, 0) > 0:
                useful_gods.append(cai_wuxing)
            if wuxing_energy['scores'].get(guan_sha_wuxing, 0) > 0:
                useful_gods.append(guan_sha_wuxing)
            
            taboo_gods = [yin_wuxing, bi_jie_wuxing] if yin_wuxing else [bi_jie_wuxing]
        else:
            # 日主弱，喜用神为同党（生、扶）
            useful_gods = []
            if wuxing_energy['scores'].get(yin_wuxing, 0) > 0:
                useful_gods.append(yin_wuxing)
            useful_gods.append(bi_jie_wuxing)
            
            taboo_gods = [shi_shang_wuxing, cai_wuxing, guan_sha_wuxing]
            taboo_gods = [g for g in taboo_gods if g]
        
        # 区分用神和喜神（简化：用神为主要用神，喜神为次要用神或第一个用神）
        favorable_god = useful_gods[1] if len(useful_gods) > 1 else (useful_gods[0] if useful_gods else '')
        
        # 格局判定
        shi_shen_dict = self.get_all_shi_shen(si_zhu)
        pattern_name = self.determine_pattern(si_zhu, shi_shen_dict)
        
        # 核心性格关键词提取
        personality_tags = self.extract_personality_tags(day_gan, day_wuxing, pattern_name, is_strong)
        
        # 生成建议（基于用神）
        suggestions = {}
        if useful_gods:
            main_god = useful_gods[0]
            suggestions = self.WUXING_SUGGESTIONS.get(main_god, {}).copy()
        
        return {
            'day_gan': day_gan,
            'day_wuxing': day_wuxing,
            'tong_dang_score': tong_dang_score,
            'yi_dang_score': yi_dang_score,
            'is_strong': is_strong,
            'strength_status': strength_status,  # 新增：强弱状态
            'pattern_name': pattern_name,  # 新增：格局名称
            'personality_tags': personality_tags,  # 新增：性格标签
            'useful_god': useful_gods[0] if useful_gods else '',
            'useful_gods': useful_gods,
            'favorable_god': favorable_god,
            'taboo_god': taboo_gods[0] if taboo_gods else '',
            'taboo_gods': taboo_gods,
            'suggestions': suggestions
        }
    
    def get_pillar_details(self, si_zhu: Dict[str, str], birth_month: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        获取四柱详细信息（包括藏干、纳音、自坐、空亡、神煞等）
        
        Args:
            si_zhu: 四柱字典
            birth_month: 出生月份（用于计算神煞）
        
        Returns:
            四柱详细信息列表
        """
        pillars = []
        pillar_names = [
            ('year', '年柱'),
            ('month', '月柱'),
            ('day', '日柱'),
            ('hour', '时柱')
        ]
        
        day_gan = si_zhu['day_gan']
        day_zhi = si_zhu['day_zhi']
        year_zhi = si_zhu.get('year_zhi', '')
        shi_shen_dict = self.get_all_shi_shen(si_zhu)
        
        # 计算空亡（根据日柱）
        kong_wang = self.get_kong_wang(day_gan, day_zhi)
        
        # 如果没有提供月份，尝试从月柱推算
        if birth_month is None:
            # 简化处理：使用月柱地支推算月份（不准确，但可用）
            month_zhi = si_zhu.get('month_zhi', '')
            month_map = {
                '寅': 1, '卯': 2, '辰': 3, '巳': 4, '午': 5, '未': 6,
                '申': 7, '酉': 8, '戌': 9, '亥': 10, '子': 11, '丑': 12
            }
            birth_month = month_map.get(month_zhi, 1)
        
        for pillar_key, pillar_name in pillar_names:
            gan = si_zhu[f'{pillar_key}_gan']
            zhi = si_zhu[f'{pillar_key}_zhi']
            gan_zhi = si_zhu[pillar_key]
            
            # 藏干
            cang_gans = self.get_cang_gan(zhi)
            
            # 纳音
            na_yin = self.get_na_yin(gan_zhi)
            
            # 星运（十二长生）- 以日主天干为基准，看各地支
            xing_yun = self.get_xing_yun(day_gan, zhi)
            
            # 十神
            shi_shen_key = f'{pillar_key}_shi_shen'
            shi_shen_value = shi_shen_dict.get(shi_shen_key, '')
            
            # 自坐（日柱的地支）
            zi_zuo = ''
            if pillar_key == 'day':
                zi_zuo = zhi
            
            # 空亡（所有柱都使用日柱的空亡）
            pillar_kong_wang = kong_wang
            
            # 神煞（需要年支和日支来计算桃花、驿马等）
            shen_sha_list = self.get_shen_sha(gan, zhi, birth_month, pillar_key, year_zhi, day_zhi)
            shen_sha = '、'.join(shen_sha_list) if shen_sha_list else ''
            
            pillars.append({
                'name': pillar_name,
                'gan': gan,
                'zhi': zhi,
                'gan_zhi': gan_zhi,
                'cang_gan': cang_gans,
                'na_yin': na_yin,
                'xing_yun': xing_yun,
                'zi_zuo': zi_zuo,
                'kong_wang': pillar_kong_wang,
                'shen_sha': shen_sha,
                'gan_wuxing': self.TIAN_GAN_WUXING.get(gan, ''),
                'zhi_wuxing': self.DI_ZHI_WUXING.get(zhi, ''),
                'shi_shen': shi_shen_value
            })
        
        return pillars
    
    def generate_bazi_report(
        self,
        birth_date: str,
        birth_time: str,
        lng: float,
        lat: float,
        gender: str
    ) -> Dict[str, Any]:
        """
        生成完整的八字分析报告（BaziReport）
        
        Args:
            birth_date: 公历日期
            birth_time: 时间
            lng: 经度
            lat: 纬度
            gender: 性别
        
        Returns:
            BaziReport 数据结构
        """
        # 基础计算
        true_solar_time = self.calculate_true_solar_time(
            birth_date, birth_time, lng, lat
        )
        si_zhu = self.get_si_zhu(true_solar_time)
        shi_shen = self.get_all_shi_shen(si_zhu)
        da_yun = self.calculate_da_yun(si_zhu, gender, birth_date)
        
        # 深度分析
        wuxing_energy = self.calculate_wuxing_energy(si_zhu)
        yong_shen = self.calculate_yong_shen(si_zhu, wuxing_energy)
        # 从出生日期中提取月份
        try:
            birth_date_obj = datetime.strptime(birth_date, '%Y-%m-%d')
            birth_month = birth_date_obj.month
        except:
            birth_month = None
        
        pillar_details = self.get_pillar_details(si_zhu, birth_month)
        
        # 计算同类和异类
        day_wuxing = yong_shen['day_wuxing']
        sheng_wo = {'木': '水', '火': '木', '土': '火', '金': '土', '水': '金'}
        wo_sheng = {'木': '火', '火': '土', '土': '金', '金': '水', '水': '木'}
        wo_ke = {'木': '土', '火': '金', '土': '水', '金': '木', '水': '火'}
        ke_wo = {'木': '金', '火': '水', '土': '木', '金': '火', '水': '土'}
        
        yin_wuxing = sheng_wo.get(day_wuxing, '')
        bi_jie_wuxing = day_wuxing
        same_kind = []
        if yin_wuxing and wuxing_energy['scores'].get(yin_wuxing, 0) > 0:
            same_kind.append(yin_wuxing)
        if wuxing_energy['scores'].get(bi_jie_wuxing, 0) > 0:
            same_kind.append(bi_jie_wuxing)
        
        shi_shang_wuxing = wo_sheng.get(day_wuxing, '')
        cai_wuxing = wo_ke.get(day_wuxing, '')
        guan_sha_wuxing = ke_wo.get(day_wuxing, '')
        different_kind = []
        for wx in [shi_shang_wuxing, cai_wuxing, guan_sha_wuxing]:
            if wx and wuxing_energy['scores'].get(wx, 0) > 0:
                different_kind.append(wx)
        
        # 计算用神分析（用神、喜神、忌神、仇神、闲神）
        gods_analysis = self.calculate_gods_analysis(yong_shen, wuxing_energy)
        
        # 重组 pillars 为对象格式（符合前端 UI 组件需求）
        pillars_dict = {}
        pillar_keys = ['year', 'month', 'day', 'hour']
        for i, pillar_key in enumerate(pillar_keys):
            pillar = pillar_details[i]
            # 提取藏干名称（仅天干）
            hidden = [cang['gan'] for cang in pillar.get('cang_gan', [])]
            
            pillars_dict[pillar_key] = {
                'stem': pillar['gan'],
                'branch': pillar['zhi'],
                'main_star': pillar.get('shi_shen', ''),
                'na_yin': self.get_na_yin_full(pillar['gan_zhi']),  # 使用完整纳音名称
                'hidden': hidden,
                'phase': pillar.get('xing_yun', ''),
                'kong_wang': pillar.get('kong_wang', ''),
                'shen_sha': pillar.get('shen_sha', '')
            }
        
        # 重组 five_elements 为数组格式（符合前端 UI 组件需求）
        wuxing_colors = {
            '木': '#10b981',  # emerald-500
            '火': '#ef4444',  # red-500
            '土': '#f59e0b',  # amber-500
            '金': '#64748b',  # slate-500
            '水': '#3b82f6'   # blue-500
        }
        
        five_elements_array = []
        for wuxing in ['木', '火', '土', '金', '水']:
            score = wuxing_energy['scores'].get(wuxing, 0)
            percent = wuxing_energy['percentages'].get(wuxing, 0)
            status = self.get_wuxing_status(
                wuxing,
                wuxing_energy['scores'],
                wuxing_energy['strongest'],
                wuxing_energy['weakest']
            )
            
            five_elements_array.append({
                'name': wuxing,
                'value': round(score, 1),
                'percent': int(percent),
                'status': status,
                'color': wuxing_colors.get(wuxing, '#6b7280')
            })
        
        # 构建 BaziReport（兼容新旧格式）
        report = {
            # 新增：命盘核心数据（符合前端 UI 组件需求）
            'day_master': si_zhu['day_gan'],
            'pillars': pillars_dict,
            'five_elements': five_elements_array,
            'gods_analysis': gods_analysis,
            
            # 保留原有格式（向后兼容）
            'chart': {
                'pillars': pillar_details,
                'si_zhu': {
                    'year': si_zhu['year'],
                    'month': si_zhu['month'],
                    'day': si_zhu['day'],
                    'hour': si_zhu['hour']
                },
                'shi_shen': shi_shen,
                'day_gan': si_zhu['day_gan'],
                'day_zhi': si_zhu['day_zhi']
            },
            'five_elements_legacy': {
                'scores': wuxing_energy['scores'],
                'percentages': wuxing_energy['percentages'],
                'strongest': wuxing_energy['strongest'],
                'weakest': wuxing_energy['weakest'],
                'missing': wuxing_energy['missing'],
                'same_kind': same_kind,
                'different_kind': different_kind,
                'details': wuxing_energy['details']
            },
            'gods': {
                'useful_god': yong_shen['useful_god'],
                'useful_gods': yong_shen['useful_gods'],
                'favorable_god': yong_shen['favorable_god'],
                'taboo_god': yong_shen['taboo_god'],
                'taboo_gods': yong_shen['taboo_gods'],
                'day_gan': yong_shen['day_gan'],
                'day_wuxing': yong_shen['day_wuxing'],
                'is_strong': yong_shen['is_strong'],
                'strength_status': yong_shen.get('strength_status', '中和'),  # 新增
                'pattern_name': yong_shen.get('pattern_name', '正格'),  # 新增
                'personality_tags': yong_shen.get('personality_tags', []),  # 新增
                'tong_dang_score': yong_shen['tong_dang_score'],
                'yi_dang_score': yong_shen['yi_dang_score'],
                'suggestions': yong_shen['suggestions']
            },
            'da_yun': da_yun,
            'true_solar_time': true_solar_time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        return report